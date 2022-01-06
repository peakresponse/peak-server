const express = require('express');
const HttpStatus = require('http-status-codes');

const helpers = require('../helpers');
const interceptors = require('../interceptors');
const models = require('../../models');

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
      const ids = {
        Response: [],
        Scene: [],
        Time: [],
        Patient: [],
        Situation: [],
        History: [],
        Disposition: [],
        Narrative: [],
        Medication: [],
        Procedure: [],
        Vital: [],
      };
      const payload = {
        Report: [],
      };
      for (const report of reports) {
        payload.Report.push(report.toJSON());
        ids.Response.push(report.responseId);
        ids.Scene.push(report.sceneId);
        ids.Time.push(report.timeId);
        ids.Patient.push(report.patientId);
        ids.Situation.push(report.situationId);
        ids.History.push(report.historyId);
        ids.Disposition.push(report.dispositionId);
        ids.Narrative.push(report.narrativeId);
        ids.Medication = ids.Medication.concat(report.medicationIds);
        ids.Procedure = ids.Procedure.concat(report.procedureIds);
        ids.Vital = ids.Vital.concat(report.vitalIds);
      }
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
      ]) {
        // eslint-disable-next-line no-await-in-loop
        payload[model] = (await models[model].findAll({ where: { id: ids[model] }, transaction })).map((record) => record.toJSON());
      }
      res.json(payload);
    });
  })
);

router.post(
  '/',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    await models.sequelize.transaction(async (transaction) => {
      // TODO: check if logged-in user is authorized to create/update
      let created;
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
        'Report',
      ]) {
        let records = req.body[model];
        if (records) {
          if (!Array.isArray(records)) {
            records = [records];
          }
          for (const record of records) {
            // eslint-disable-next-line no-await-in-loop
            [, created] = await models[model].createOrUpdate(req.user, req.agency, record, {
              transaction,
            });
          }
        }
      }
      res.status(created ? HttpStatus.CREATED : HttpStatus.OK).end();
    });
  })
);

router.get(
  '/:id',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    await models.sequelize.transaction(async (transaction) => {
      const report = await models.Report.findByPk(req.params.id, { transaction });
      res.status(HttpStatus.OK).json(report.toJSON());
    });
  })
);

module.exports = router;
