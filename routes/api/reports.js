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
        File: [],
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
        ids.File = ids.File.concat(report.fileIds);
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
        'File',
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
        'File',
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
