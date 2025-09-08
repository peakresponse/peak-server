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
      const records = await req.agency.importDEMCustomConfigurations(req.user, { transaction });
      const draftVersion = await req.agency.getDraftVersion({ transaction });
      await draftVersion.updateDEMCustomConfiguration({ transaction });
      payload = await Promise.all(records.map((r) => r.toNemsisJSON({ transaction })));
    });
    if (payload) {
      res.json(payload);
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
    }
  }),
);

base.addAllRoutes(router, models.CustomConfiguration, {
  index: {
    order: [
      ['dataSet', 'ASC'],
      ['id', 'ASC'],
    ],
  },
  create: {
    async afterCreate(version, record, options) {
      return version.updateDEMCustomConfiguration({ transaction: options?.transaction });
    },
  },
  update: {
    async afterSave(version, record, options) {
      return version.updateDEMCustomConfiguration({ transaction: options?.transaction });
    },
  },
  delete: {
    async afterDestroy(version, record, options) {
      return version.updateDEMCustomConfiguration({ transaction: options?.transaction });
    },
  },
});

module.exports = router;
