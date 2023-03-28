const express = require('express');
const HttpStatus = require('http-status-codes');

const models = require('../../../models');
const helpers = require('../../helpers');
const interceptors = require('../../interceptors');

const router = express.Router();

router.get(
  '/',
  interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
  helpers.async(async (req, res) => {
    const page = req.query.page || 1;
    const { docs, pages, total } = await models.Configuration.paginate({
      page,
      include: ['draft', 'state'],
      where: { createdByAgencyId: req.agency.id },
      order: [['state', 'name', 'ASC']],
    });
    helpers.setPaginationHeaders(req, res, page, pages, total);
    res.json(await Promise.all(docs.map((d) => d.toNemsisJSON())));
  })
);

router.post(
  '/',
  interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
  helpers.async(async (req, res) => {
    const version = await req.agency.getOrCreateDraftVersion(req.user);
    const record = await models.Configuration.create({
      versionId: version.id,
      isDraft: true,
      createdByAgencyId: req.agency.id,
      data: req.body.data,
      createdById: req.user.id,
      updatedById: req.user.id,
    });
    res.status(HttpStatus.CREATED).json(await record.toNemsisJSON());
  })
);

router.get(
  '/:id',
  interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
  helpers.async(async (req, res) => {
    const record = await models.Configuration.findOne({
      where: {
        id: req.params.id,
        createdByAgencyId: req.agency.id,
      },
    });
    if (record) {
      res.status(HttpStatus.OK).json(await record.toNemsisJSON());
    } else {
      res.status(HttpStatus.NOT_FOUND).end();
    }
  })
);

router.put(
  '/:id/import',
  interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
  helpers.async(async (req, res) => {})
);

router.put(
  '/:id',
  interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
  helpers.async(async (req, res) => {
    let record = await models.Configuration.findOne({
      where: {
        id: req.params.id,
        createdByAgencyId: req.agency.id,
      },
    });
    if (record) {
      const { archivedAt, data } = req.body;
      const version = await req.agency.getOrCreateDraftVersion(req.user);
      record = await record.updateDraft({ versionId: version.id, archivedAt, data });
      res.status(HttpStatus.OK).json(await record.toNemsisJSON());
    } else {
      res.status(HttpStatus.NOT_FOUND).end();
    }
  })
);

router.delete(
  '/:id',
  interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
  helpers.async(async (req, res) => {
    await models.sequelize.transaction(async (transaction) => {
      let record = await models.Configuration.findOne({
        where: {
          id: req.params.id,
          createdByAgencyId: req.agency.id,
        },
        transaction,
      });
      if (!record.isDraft) {
        record = await record.getDraft({ transaction });
      }
      if (record) {
        await record.destroy({ transaction });
      }
    });
    res.status(HttpStatus.NO_CONTENT).end();
  })
);

module.exports = router;
