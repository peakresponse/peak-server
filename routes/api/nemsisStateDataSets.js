const express = require('express');
const fs = require('fs');
const { StatusCodes } = require('http-status-codes');

const helpers = require('../helpers');
const interceptors = require('../interceptors');
const models = require('../../models');
const nemsisStates = require('../../lib/nemsis/states');
const { NemsisStateDataSetParser } = require('../../lib/nemsis/stateDataSetParser');

const router = express.Router();

router.get(
  '/',
  interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
  helpers.async(async (req, res) => {
    const page = req.query.page || 1;
    const options = {
      page,
      include: ['state'],
      order: [
        ['state', 'name', 'ASC'],
        ['version', 'DESC'],
        ['createdAt', 'DESC'],
      ],
    };
    const { stateId } = req.query ?? {};
    if (stateId) {
      options.where = { stateId };
    }
    const { docs, pages, total } = await models.NemsisStateDataSet.paginate(options);
    helpers.setPaginationHeaders(req, res, page, pages, total);
    res.json(docs.map((r) => r.toJSON()));
  }),
);

router.post(
  '/',
  interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
  helpers.async(async (req, res) => {
    const { stateId, version, file, fileName } = req.body;
    let record;
    if (stateId && version) {
      const repo = nemsisStates.getNemsisStateRepo(stateId, '3.5.0');
      await repo.pull();
      await repo.install(version);
      const stateDataSetParser = repo.getDataSetParser(version);
      const nemsisVersion = await stateDataSetParser.getNemsisVersion();
      record = await models.NemsisStateDataSet.create({
        stateId,
        nemsisVersion,
        version,
        createdById: req.user.id,
        updatedById: req.user.id,
      });
    } else if (stateId && file && fileName) {
      let tmpPath;
      try {
        await models.sequelize.transaction(async (transaction) => {
          record = await models.NemsisStateDataSet.create(
            {
              stateId,
              file,
              fileName,
              createdById: req.user.id,
              createdByAgencyId: req.agency?.id,
              updatedById: req.user.id,
            },
            { transaction },
          );
          tmpPath = await record.downloadAssetFile('file', true);
          const stateDataSetParser = new NemsisStateDataSetParser(tmpPath);
          const nemsisVersion = await stateDataSetParser.getNemsisVersion();
          const fileStateId = await stateDataSetParser.getStateId();
          if (stateId !== fileStateId) {
            throw new Error('stateId');
          }
          await record.update({ nemsisVersion }, { transaction });
        });
      } catch (err) {
        if (err.message === 'stateId') {
          res.status(StatusCodes.UNPROCESSABLE_ENTITY).end();
          return;
        }
        record = null;
      } finally {
        if (tmpPath) {
          await fs.promises.rm(tmpPath, { force: true });
        }
      }
    }
    if (record) {
      res.status(StatusCodes.CREATED).json(record.toJSON());
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
    }
  }),
);

router.post(
  '/:id/import',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    const stateDataSet = await models.NemsisStateDataSet.findByPk(req.params.id);
    if (stateDataSet) {
      await stateDataSet.startImportDataSet(req.user, stateDataSet);
      res.json(stateDataSet.toJSON());
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  }),
);

router.delete(
  '/:id/import',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    let stateDataSet;
    await models.sequelize.transaction(async (transaction) => {
      stateDataSet = await models.NemsisStateDataSet.findByPk(req.params.id, { transaction });
      if (stateDataSet) {
        await stateDataSet.cancelImportDataSet({ transaction });
        await stateDataSet.reload({ transaction });
      }
    });
    if (stateDataSet) {
      res.json(stateDataSet.toJSON());
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  }),
);

router.get(
  '/:id',
  interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
  helpers.async(async (req, res) => {
    const stateDataSet = await models.NemsisStateDataSet.findByPk(req.params.id);
    if (stateDataSet) {
      res.json(stateDataSet.toJSON());
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  }),
);

module.exports = router;
