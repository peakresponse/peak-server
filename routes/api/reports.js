const express = require('express');
const HttpStatus = require('http-status-codes');

const helpers = require('../helpers');
const interceptors = require('../interceptors');
const models = require('../../models');

const router = express.Router();

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
