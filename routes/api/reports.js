const express = require('express');
const HttpStatus = require('http-status-codes');
const _ = require('lodash');

const helpers = require('../helpers');
const interceptors = require('../interceptors');
const models = require('../../models');
const { dispatchIncidentUpdate, dispatchReportUpdate } = require('../../wss');

const router = express.Router();

router.get(
  '/',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    const options = {
      include: ['patient', 'disposition'],
      order: [['createdAt', 'desc']],
      where: {},
    };
    const { incidentId } = req.query;
    if (!incidentId) {
      res.status(HttpStatus.UNPROCESSABLE_ENTITY).end();
      return;
    }
    options.where.incidentId = incidentId;
    await models.sequelize.transaction(async (transaction) => {
      options.transaction = transaction;
      const reports = await models.Report.scope('canonical').findAll(options);
      const payload = await models.Report.createPayload(reports, { transaction });
      res.json(payload);
    });
  }),
);

/* eslint-disable no-await-in-loop */
router.post(
  '/',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    const incidentIds = [];
    const reportIds = [];
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
              const incident = models.Incident.build({
                ..._.pick(record, ['id', 'sceneId', 'number']),
                psapId: req.agency.psapId,
                createdById: req.user.id,
                updatedById: req.user.id,
                createdByAgencyId: req.agency.id,
                updatedByAgencyId: req.agency.id,
              });
              if (!incident.number) {
                if (incident.psapId) {
                  // get the latest incident number, make unique
                  const prevIncident = await models.Incident.findOne({
                    where: {
                      psapId: incident.psapId,
                    },
                    order: [['number', 'DESC']],
                    transaction,
                  });
                  if (prevIncident) {
                    const { number } = prevIncident;
                    const m = number.match(/^(\d+)-(\d+)$/);
                    if (m) {
                      const prevNumber = parseInt(m[2], 10);
                      incident.number = `${m[1]}-${`${prevNumber + 1}`.padStart(3, '0')}`;
                    } else {
                      incident.number = `${number}-001`;
                    }
                  } else {
                    incident.number = '1';
                  }
                } else {
                  // get the latest incident number, increment
                  const { docs } = await models.Incident.paginate('Agency', req.agency, { paginate: 1, transaction });
                  if (docs.length === 1) {
                    const [prevIncident] = docs;
                    const prevNumber = parseInt(prevIncident.number, 10);
                    incident.number = `${prevNumber + 1}`;
                  } else {
                    incident.number = '1';
                  }
                }
              } else {
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
                  const { number } = dupeIncident;
                  const m = number.match(/^(\d+)-(\d+)$/);
                  if (m) {
                    options = {
                      where: {
                        number: {
                          [models.Sequelize.Op.iLike]: `${m[1]}-%`,
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
                    incident.number = `${m[1]}-${`${count + 1}`.padStart(3, '0')}`;
                  } else {
                    incident.number = `${number}-001`;
                  }
                }
              }
              await incident.save({ transaction });
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
                      _.set(response.data, ['eResponse', 'eResponse.03', '_text'], incident.number);
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
                reportIds.push(obj.canonicalId);
              }
            }
          }
        }
      }
      res.status(created ? HttpStatus.CREATED : HttpStatus.OK).json(payload);
    });
    await Promise.all([
      Promise.all(_.uniq(incidentIds).map((id) => dispatchIncidentUpdate(id))),
      Promise.all(reportIds.map((id) => dispatchReportUpdate(id))),
    ]);
    const exportTriggers = await req.agency.getExportTriggers({
      where: {
        type: 'SAVE',
        isEnabled: true,
      },
    });
    await Promise.all(reportIds.map((id) => Promise.all(exportTriggers.map((et) => et.execute(id)))));
  }),
);
/* eslint-enable no-await-in-loop */

router.get(
  '/:id',
  interceptors.requireAgency(),
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
  '/:id/preview',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    await models.sequelize.transaction(async (transaction) => {
      let report = await models.Report.findByPk(req.params.id, { transaction });
      if (report) {
        await report.regenerate({ transaction });
        if (report.isCanonical) {
          report = await report.getCurrent({ transaction });
        }
        res.redirect(report.emsDataSetFileUrl);
      } else {
        res.status(HttpStatus.NOT_FOUND).end();
      }
    });
  }),
);

module.exports = router;
