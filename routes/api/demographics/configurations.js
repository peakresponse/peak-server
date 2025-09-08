const express = require('express');
const { StatusCodes } = require('http-status-codes');

const models = require('../../../models');

const { Roles } = models.Employment;
const helpers = require('../../helpers');
const interceptors = require('../../interceptors');
const base = require('./base');

const router = express.Router();

router.post(
  '/import',
  interceptors.requireAgency(Roles.CONFIGURATION),
  helpers.async(async (req, res) => {
    let payload;
    await models.sequelize.transaction(async (transaction) => {
      const record = await req.agency.importConfiguration(req.user, { transaction });
      payload = await record.toNemsisJSON({ transaction });
    });
    if (payload) {
      res.json(payload);
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
    }
  }),
);

base.addAllRoutes(router, models.Configuration, {
  index: {
    include: ['state'],
    order: [['state', 'name', 'ASC']],
  },
});

module.exports = router;
