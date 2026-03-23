const express = require('express');
const { StatusCodes } = require('http-status-codes');

const helpers = require('../../helpers');
const interceptors = require('../../interceptors');
const models = require('../../../models');

const { Roles } = models.Employment;

const router = express.Router();

router.get(
  '/',
  interceptors.requireAgency(Roles.CONFIGURATION),
  helpers.async(async (req, res) => {
    res.json(await req.agency.toNemsisJSON());
  }),
);

router.put(
  '/',
  interceptors.requireAgency(Roles.CONFIGURATION),
  helpers.async(async (req, res) => {
    const { data } = req.body;
    const version = await req.agency.getOrCreateDraftVersion(req.user);
    await req.agency.updateDraft({ versionId: version.id, data, updatedById: req.user.id });
    const draft = await req.agency.getDraft();
    res.status(StatusCodes.OK).json(await draft.toNemsisJSON());
  }),
);

router.delete(
  '/',
  interceptors.requireAgency(Roles.CONFIGURATION),
  helpers.async(async (req, res) => {
    await models.sequelize.transaction(async (transaction) => {
      const draft = await req.agency.getDraft({ transaction });
      if (draft) {
        await draft.destroy({ transaction });
      }
    });
    res.status(StatusCodes.NO_CONTENT).end();
  }),
);

module.exports = router;
