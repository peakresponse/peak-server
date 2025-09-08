const express = require('express');
const { StatusCodes } = require('http-status-codes');
const _ = require('lodash');

const helpers = require('../helpers');
const interceptors = require('../interceptors');
const models = require('../../models');

const { Roles } = models.Employment;
const { dispatchIncidentUpdate, dispatchReportUpdate } = require('../../wss');
const routed = require('../../lib/routed');

const router = express.Router();

router.get(
  '/',
  interceptors.requireAgency([Roles.INTEGRATION, Roles.USER]),
  helpers.async(async (req, res) => {
    const options = {
      include: ['patient', 'disposition'],
      order: [['createdAt', 'desc']],
      where: {},
    };
    const { incidentId } = req.query;
    const employment = await req.user.isEmployedBy(req.agency);
    if (employment?.roles.includes(Roles.INTEGRATION)) {
      // return a paginated list of reports for the agency
      options.include.push('response', 'incident');
      options.where.createdByAgencyId = req.agency.id;
      const { page = 1 } = req.query;
      const { docs, pages, total } = await models.Report.scope('canonical').paginate(options);
      helpers.setPaginationHeaders(req, res, page, pages, total);
      res.json(docs.map((d) => d.toIntegrationJSON()));
    } else if (incidentId) {
      // return reports for the given incident, in mobile payload format
      options.where.incidentId = incidentId;
      let payload;
      await models.sequelize.transaction(async (transaction) => {
        options.transaction = transaction;
        const reports = await models.Report.scope('canonical').findAll(options);
        payload = await models.Report.createPayload(reports, { transaction });
      });
      res.json(payload);
    } else {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).end();
    }
  }),
);

/* eslint-disable no-await-in-loop */
router.post(
  '/',
  interceptors.requireAgency(Roles.USER),
  helpers.async(async (req, res) => {
    const { psapId } = req.agency;
    const assignment = await req.user.getCurrentAssignment({
      include: ['vehicle'],
    });
    const incidentIds = [];
    const reportIds = [];
    const canonicalReportIds = [];
    const sceneIds = [];
    await models.sequelize.transaction(async (transaction) => {
      // TODO: check if logged-in user is authorized to create/update
      const payload = {};
      let created;
      let obj;
      for (const model of [
        'Scene',
        'Incident',
        'Dispatch',
        'Response',
        'Time',
        'Patient',
        'Situation',
        'History',
        'Disposition',
        'Narrative',
        'Medication',
        'Procedure',
        'Vital',
        'File',
        'Signature',
        'Report',
      ]) {
        let records = req.body[model];
        if (records) {
          if (!Array.isArray(records)) {
            records = [records];
          }
          for (const record of records) {
            if (model === 'Incident') {
              const [incident, isNewIncident] = await models.Incident.findOrBuild({
                where: {
                  id: record.id,
                },
                defaults: {
                  ..._.pick(record, ['id', 'eventId', 'sceneId', 'number']),
                  psapId,
                  createdById: req.user.id,
                  updatedById: req.user.id,
                  createdByAgencyId: req.agency.id,
                  updatedByAgencyId: req.agency.id,
                },
                transaction,
              });
              if (isNewIncident) {
                if (!incident.number) {
                  if (psapId) {
                    // generate a unique number from Unit/Vehicle no if any, fallback to NOUNIT
                    const prefix = assignment?.vehicle?.number ?? 'NOUNIT';
                    // count the number of prior incidents with this prefix
                    const count = await models.Incident.count({
                      where: {
                        psapId,
                        number: {
                          [models.Sequelize.Op.iLike]: `${prefix}-%`,
                        },
                      },
                      transaction,
                    });
                    // increment number
                    incident.number = `${prefix}-${count + 1}`;
                    // set sort with current highest number
                    incident.sort = await models.Incident.max('sort', { where: { psapId }, transaction });
                  } else {
                    // get the latest incident, increment sort
                    const options = {
                      order: [['sort', 'desc']],
                      transaction,
                    };
                    if (psapId) {
                      options.where = { psapId };
                    } else {
                      options.where = { createdByAgencyId: req.agency.id };
                    }
                    const prevIncident = await models.Incident.findOne(options);
                    if (prevIncident) {
                      incident.number = `${BigInt(prevIncident.sort) + BigInt(1)}`.padStart(3, '0');
                    } else {
                      incident.number = '1'.padStart(3, '0');
                    }
                  }
                } else {
                  // ensure at least 3 chars long
                  incident.number = incident.number.padStart(3, '0');
                  // check if number is a duplicate
                  let options = {
                    where: {
                      id: {
                        [models.Sequelize.Op.ne]: incident.id,
                      },
                      number: incident.number,
                    },
                    transaction,
                  };
                  if (incident.psapId) {
                    options.where.psapId = incident.psapId;
                  } else {
                    options.where.createdByAgencyId = req.agency.id;
                  }
                  const dupeIncident = await models.Incident.findOne(options);
                  if (dupeIncident) {
                    // de-dupe with a unique suffix
                    let { number } = dupeIncident;
                    const m = number.match(/^([^-]+)-(\d+)$/);
                    if (m) {
                      [, number] = m;
                    }
                    options = {
                      where: {
                        number: {
                          [models.Sequelize.Op.iLike]: `${number}-%`,
                        },
                      },
                      transaction,
                    };
                    if (incident.psapId) {
                      options.where.psapId = incident.psapId;
                    } else {
                      options.where.createdByAgencyId = req.agency.id;
                    }
                    const count = await models.Incident.count(options);
                    incident.number = `${number}-${`${count + 1}`.padStart(3, '0')}`;
                  }
                  if (!incident.sort) {
                    options = {
                      where: {},
                      transaction,
                    };
                    if (incident.psapId) {
                      options.where.psapId = incident.psapId;
                    } else {
                      options.where.createdByAgencyId = req.agency.id;
                    }
                    incident.sort = await models.Incident.max('sort', options);
                  }
                }
                await incident.save({ transaction });
              }
              // search for the Report(s) that match this Incident, update Response incidentNumber
              let { Report: reports = [], Response: responses = [] } = req.body;
              if (!Array.isArray(reports)) {
                reports = [reports];
              }
              if (!Array.isArray(responses)) {
                responses = [responses];
              }
              let reportsCount = 0;
              for (const report of reports) {
                if (report.incidentId === incident.id) {
                  reportsCount += 1;
                  for (const response of responses) {
                    if (response.id === report.responseId) {
                      _.unset(response.data, ['eResponse.03', '_attributes']);
                      _.set(response.data, ['eResponse.03', '_text'], incident.number);
                      payload.Response = payload.Response || [];
                      payload.Response.push(response);
                      break;
                    }
                  }
                }
              }
              payload.Incident = payload.Incident || [];
              payload.Incident.push({ ...incident.toJSON(), reportsCount });
            } else {
              [obj, created] = await models[model].createOrUpdate(req.user, req.agency, record, {
                transaction,
              });
              if (model === 'Report') {
                incidentIds.push(obj.incidentId);
                reportIds.push(obj.id);
                canonicalReportIds.push(obj.canonicalId);
                sceneIds.push(obj.sceneId);
              }
            }
          }
        }
      }
      res.status(created ? StatusCodes.CREATED : StatusCodes.OK).json(payload);
    });
    await Promise.all([
      Promise.all(_.uniq(incidentIds).map((id) => dispatchIncidentUpdate(id))),
      Promise.all(_.uniq(sceneIds).map((id) => routed.dispatchSceneUpdate(id, true))),
      Promise.all(canonicalReportIds.map((id) => dispatchReportUpdate(id))),
    ]);
    const exportTriggers = await req.agency.getExportTriggers({
      include: ['export'],
      where: {
        type: 'SAVE',
        isEnabled: true,
      },
    });
    await Promise.all(reportIds.map((id) => Promise.all(exportTriggers.map((et) => et.dispatch(id)))));
  }),
);
/* eslint-enable no-await-in-loop */

router.get(
  '/:id',
  interceptors.requireAgency(Roles.USER),
  helpers.async(async (req, res) => {
    await models.sequelize.transaction(async (transaction) => {
      const report = await models.Report.findByPk(req.params.id, {
        include: ['disposition', 'patient'],
        transaction,
      });
      const payload = await models.Report.createPayload([report], { transaction });
      res.json(payload);
    });
  }),
);

router.get(
  '/:id/export',
  interceptors.requireAgency([Roles.INTEGRATION, Roles.USER]),
  helpers.async(async (req, res) => {
    await models.sequelize.transaction(async (transaction) => {
      let report = await models.Report.findByPk(req.params.id, {
        attributes: { include: ['emsDataSetFile', 'emsDataSetFileUrl'] },
        transaction,
      });
      if (report) {
        await report.regenerate({ transaction });
        if (report.isCanonical) {
          report = await models.Report.findByPk(report.currentId, {
            attributes: { include: ['emsDataSetFile', 'emsDataSetFileUrl'] },
            transaction,
          });
        }
        res.redirect(report.emsDataSetFileUrl);
      } else {
        res.status(StatusCodes.NOT_FOUND).end();
      }
    });
  }),
);

module.exports = router;
