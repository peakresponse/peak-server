/* eslint-disable no-await-in-loop */
const express = require('express');
const fs = require('fs');
const HttpStatus = require('http-status-codes');
const _ = require('lodash');
const { mkdirp } = require('mkdirp');
const path = require('path');
const uuid = require('uuid/v4');

const models = require('../../models');
const interceptors = require('../interceptors');
const helpers = require('../helpers');
const nemsis = require('../../lib/nemsis');
const nemsisStates = require('../../lib/nemsis/states');

const router = express.Router();

router.get('/', (req, res) => {
  models.State.findAll({
    order: [['name', 'ASC']],
  }).then((records) => {
    res.json(records.map((r) => r.toJSON()));
  });
});

router.get('/new', interceptors.requireAdmin, (req, res) => {
  /// fetch the list of repos from the NEMSIS states project
  nemsis.getStateRepos().then((json) => res.json(json));
});

router.get(
  '/:id/agencies',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    const state = await models.State.findByPk(req.params.id);
    if (state) {
      res.json({
        count: await models.Agency.scope('canonical').count({
          where: {
            stateId: state.id,
          },
        }),
      });
    } else {
      res.status(HttpStatus.NOT_FOUND).end();
    }
  })
);

router.get(
  '/:id/facilities',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    const state = await models.State.findByPk(req.params.id);
    if (state) {
      const results = await models.Facility.scope('canonical').count({
        where: {
          stateId: state.id,
        },
        group: ['type'],
      });
      results.sort((a, b) => (a.type ?? '').localeCompare(b.type ?? ''));
      res.json(results);
    } else {
      res.status(HttpStatus.NOT_FOUND).end();
    }
  })
);

router.get(
  '/:id/cities',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    const state = await models.State.findByPk(req.params.id);
    if (state) {
      const results = await models.City.count({
        where: {
          stateNumeric: state.id,
        },
        group: ['featureClass'],
      });
      results.sort((a, b) => (a.featureClass ?? '').localeCompare(b.featureClass ?? ''));
      res.json(results);
    } else {
      res.status(HttpStatus.NOT_FOUND).end();
    }
  })
);

router.get(
  '/:id/counties',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    const state = await models.State.findByPk(req.params.id);
    if (state) {
      res.json({
        count: await models.County.count({
          where: {
            stateCode: state.id,
          },
        }),
      });
    } else {
      res.status(HttpStatus.NOT_FOUND).end();
    }
  })
);

router.get(
  '/:id/psaps',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    const state = await models.State.findByPk(req.params.id);
    if (state) {
      res.json({
        count: await models.Psap.count({
          where: {
            stateId: state.id,
          },
        }),
      });
    } else {
      res.status(HttpStatus.NOT_FOUND).end();
    }
  })
);

router.post(
  '/:id/import',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    const tmpDir = path.resolve(__dirname, '../../tmp/uploads/import');
    const tmpFile = path.resolve(tmpDir, `${uuid()}.xml`);
    try {
      await mkdirp(path.dirname(tmpFile));
      await fs.promises.writeFile(tmpFile, req.body);
      const state = await models.State.findByPk(req.params.id);
      if (state) {
        // await state.startImportDataSet(req.user, new NemsisStateDataSet(null, tmpFile));
        res.json(state.toJSON());
      } else {
        res.status(HttpStatus.NOT_FOUND).end();
      }
    } catch (err) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).end();
    }
  })
);

router.get(
  '/:id/repository',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    const repo = nemsisStates.getNemsisStateRepo(req.params.id, '3.5.0');
    if (repo) {
      res.json(repo.toJSON());
    } else {
      res.status(HttpStatus.NOT_FOUND).end();
    }
  })
);

router.delete(
  '/:id/repository/import',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    const state = await models.State.findByPk(req.params.id);
    if (state) {
      await state.cancelImportDataSet();
      await state.reload();
      res.json(state.toJSON());
    } else {
      res.status(HttpStatus.NOT_FOUND).end();
    }
  })
);

router.put(
  '/:id/repository/import',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    const { dataSetVersion } = req.query;
    const state = await models.State.findByPk(req.params.id);
    if (state) {
      let stateDataSet = await models.NemsisStateDataSet.findOne({
        where: {
          stateId: state.id,
          version: dataSetVersion,
        },
      });
      if (!stateDataSet) {
        const repo = nemsisStates.getNemsisStateRepo(this.state.id, '3.5.0');
        const stateDataSetParser = repo.getDataSetParser(dataSetVersion);
        try {
          const dataSetNemsisVersion = await stateDataSetParser.getNemsisVersion();
          stateDataSet = await models.NemsisStateDataSet.create({
            stateId: state.id,
            nemsisVersion: dataSetNemsisVersion,
            version: dataSetVersion,
            createdById: req.user.id,
            updatedById: req.user.id,
          });
        } catch {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).end();
        }
      }
      await state.startImportDataSet(req.user, stateDataSet);
      res.json(state.toJSON());
    } else {
      res.status(HttpStatus.NOT_FOUND).end();
    }
  })
);

router.put(
  '/:id/repository',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    const repo = nemsisStates.getNemsisStateRepo(req.params.id, '3.5.0');
    if (repo) {
      await repo.pull();
      res.json(repo.toJSON()).end();
    } else {
      res.status(HttpStatus.NOT_FOUND).end();
    }
  })
);

router.patch(
  '/:id',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    const { id } = req.params;
    let state;
    await models.sequelize.transaction(async (transaction) => {
      state = await models.State.findByPk(id, { transaction });
      if (state) {
        await state.update(_.pick(req.body, ['isConfigured']));
      }
    });
    if (state) {
      res.json(state.toJSON());
    } else {
      res.status(HttpStatus.NOT_FOUND).end();
    }
  })
);

router.get(
  '/:id',
  helpers.async(async (req, res) => {
    const { id } = req.params;
    const state = await models.State.unscoped().findOne({
      where: { id },
      attributes: { exclude: ['dataSetXml', 'schematronXml'] },
    });
    if (state) {
      if (req.user?.isAdmin && state.dataSet?.status) {
        res.setHeader('X-Status-Code', state.dataSet.status.code);
        res.setHeader('X-Status', state.dataSet.status.message);
      }
      res.json(state.toJSON());
    } else {
      res.status(HttpStatus.NOT_FOUND).end();
    }
  })
);

module.exports = router;
