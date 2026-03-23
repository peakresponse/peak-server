const express = require('express');
const fs = require('fs');
const { StatusCodes } = require('http-status-codes');

const helpers = require('../helpers');
const interceptors = require('../interceptors');
const models = require('../../models');

const { Roles } = models.Employment;
const nemsisStates = require('../../lib/nemsis/states');
const { NemsisSchematronParser } = require('../../lib/nemsis/schematronParser');

const router = express.Router();

router.get(
  '/',
  interceptors.requireAgency(Roles.CONFIGURATION),
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
    const { docs, pages, total } = await models.NemsisSchematron.paginate(options);
    helpers.setPaginationHeaders(req, res, page, pages, total);
    res.json(docs.map((r) => r.toJSON()));
  }),
);

router.post(
  '/',
  interceptors.requireAgency(Roles.CONFIGURATION),
  helpers.async(async (req, res) => {
    const { stateId, dataSet, version, file, fileName } = req.body;
    let record;
    if (stateId && dataSet && version) {
      const repo = nemsisStates.getNemsisStateRepo(stateId, '3.5.0');
      await repo.pull();
      await repo.install(version);
      const schematronParser = repo.getSchematronParser(dataSet, version);
      const nemsisVersion = await schematronParser.getNemsisVersion();
      record = await models.NemsisSchematron.create({
        stateId,
        dataSet,
        nemsisVersion,
        version,
        createdById: req.user.id,
        updatedById: req.user.id,
      });
    } else if (stateId && dataSet && file && fileName) {
      let tmpPath;
      try {
        await models.sequelize.transaction(async (transaction) => {
          record = await models.NemsisSchematron.create(
            {
              stateId,
              dataSet,
              file,
              fileName,
              createdById: req.user.id,
              createdByAgencyId: req.agency?.id,
              updatedById: req.user.id,
            },
            { transaction },
          );
          tmpPath = await record.downloadAssetFile('file', true);
          const schematronParser = new NemsisSchematronParser(tmpPath);
          const nemsisVersion = await schematronParser.getNemsisVersion();
          const fileVersion = await schematronParser.getFileVersion();
          const fileDataSet = await schematronParser.getDataSet();
          if (dataSet !== fileDataSet) {
            throw new Error('dataSet');
          }
          await record.update({ nemsisVersion, fileVersion }, { transaction });
        });
      } catch (err) {
        if (err.message === 'dataSet') {
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

router.get(
  '/:id',
  interceptors.requireAgency(Roles.CONFIGURATION),
  helpers.async(async (req, res) => {
    const schematron = await models.NemsisSchematron.findByPk(req.params.id);
    if (schematron) {
      res.json(schematron.toJSON());
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  }),
);

module.exports = router;
