const express = require('express');
const HttpStatus = require('http-status-codes');

const models = require('../../../models');
const helpers = require('../../helpers');
const interceptors = require('../../interceptors');
const base = require('./base');

const router = express.Router();

router.post(
  '/import',
  interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
  helpers.async(async (req, res) => {
    let payload;
    await models.sequelize.transaction(async (transaction) => {
      const record = await req.agency.importConfiguration(req.user, { transaction });
      payload = await record.toNemsisJSON({ transaction });
    });
    if (payload) {
      res.json(payload);
    } else {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).end();
    }
  })
);

base.addAllRoutes(router, models.Configuration, { include: ['state'], order: [['state', 'name', 'ASC']] });

module.exports = router;
