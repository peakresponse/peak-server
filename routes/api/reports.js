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
  })
);

router.post(
  '/',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    const incidentIds = [];
    const reportIds = [];
    await models.sequelize.transaction(async (transaction) => {
      // TODO: check if logged-in user is authorized to create/update
      let created;
      let obj;
      for (const model of [
        'Response',
        'Scene',
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
        'Report',
      ]) {
        let records = req.body[model];
        if (records) {
          if (!Array.isArray(records)) {
            records = [records];
          }
          for (const record of records) {
            if (req.apiLevel === 1) {
              if (model === 'Scene') {
                if (!record.canonicalId) {
                  // eslint-disable-next-line no-continue
                  continue;
                }
              }
              if (model === 'Report') {
                if (record.sceneId) {
                  // eslint-disable-next-line no-await-in-loop
                  const scene = await models.Scene.findByPk(record.sceneId, { transaction });
                  if (scene.isCanonical) {
                    record.sceneId = scene.currentId;
                  }
                }
              }
            }
            // eslint-disable-next-line no-await-in-loop
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
      res.status(created ? HttpStatus.CREATED : HttpStatus.OK).end();
    });
    await Promise.all(_.uniq(incidentIds).map((id) => dispatchIncidentUpdate(id)));
    await Promise.all(reportIds.map((id) => dispatchReportUpdate(id)));
  })
);

router.get(
  '/:id',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    await models.sequelize.transaction(async (transaction) => {
      const report = await models.Report.findByPk(req.params.id, {
        include: [
          'response',
          { model: models.Scene, as: 'scene', include: ['city', 'state'] },
          'time',
          'patient',
          'situation',
          'history',
          'disposition',
          'narrative',
          'medications',
          'procedures',
          'vitals',
          'files',
        ],
        transaction,
      });
      const payload = {
        City: [report.scene.city.toJSON()],
        State: [report.scene.state.toJSON()],
        Report: [report.toJSON()],
        Response: [report.response.toJSON()],
        Scene: [report.scene.toJSON()],
        Time: [report.time.toJSON()],
        Patient: [report.patient.toJSON()],
        Situation: [report.situation.toJSON()],
        History: [report.history.toJSON()],
        Disposition: [report.disposition.toJSON()],
        Narrative: [report.narrative.toJSON()],
        Medication: report.medications.map((m) => m.toJSON()),
        Procedure: report.procedures.map((m) => m.toJSON()),
        Vital: report.vitals.map((m) => m.toJSON()),
        File: report.files.map((m) => m.toJSON()),
      };
      res.json(payload);
    });
  })
);

module.exports = router;
