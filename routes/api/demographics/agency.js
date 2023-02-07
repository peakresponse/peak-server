const express = require('express');
const HttpStatus = require('http-status-codes');
const _ = require('lodash');

const helpers = require('../../helpers');
const interceptors = require('../../interceptors');
const models = require('../../../models');

const router = express.Router();

router.get(
  '/',
  interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
  helpers.async(async (req, res) => {
    const { id, data } = req.agency;
    const payload = { id, data };
    const draft = await req.agency.getDraft();
    if (draft) {
      payload.draft = _.pick(draft, ['id', 'data', 'isValid', 'validationErrors']);
    }
    res.json(payload);
  })
);

router.put(
  '/',
  interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
  helpers.async(async (req, res) => {
    const { data } = req.body;
    await req.agency.updateDraft({ data });
    const draft = await req.agency.getDraft();
    res.status(HttpStatus.OK).json(_.pick(draft, ['id', 'data', 'isValid', 'validationErrors']));
  })
);

router.delete(
  '/',
  interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
  helpers.async(async (req, res) => {
    await models.sequelize.transaction(async (transaction) => {
      const draft = await req.agency.getDraft({ transaction });
      if (draft) {
        await draft.destroy({ transaction });
      }
    });
    res.status(HttpStatus.NO_CONTENT).end();
  })
);

module.exports = router;
