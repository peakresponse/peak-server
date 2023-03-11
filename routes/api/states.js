/* eslint-disable no-await-in-loop */
const express = require('express');
const HttpStatus = require('http-status-codes');

const models = require('../../models');
const interceptors = require('../interceptors');
const helpers = require('../helpers');
const nemsis = require('../../lib/nemsis');
const nemsisRepositories = require('../../lib/nemsis/repositories');

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
        order: [['type', 'ASC']],
      });
      results.sort((a, b) => (a.type ?? '').localeCompare(b.type ?? ''));
      res.json(results);
    } else {
      res.status(HttpStatus.NOT_FOUND).end();
    }
  })
);

router.post(
  '/:id/configure',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    const state = await models.State.findByPk(req.params.id);
    if (!state) {
      res.status(HttpStatus.NOT_FOUND).end();
      return;
    }
    await state.startConfiguration(req.user);
    /// send back ACCEPTED state while processing continues in background
    res.status(HttpStatus.ACCEPTED).json(state);
  })
);

router.get(
  '/:id/repository',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    const repo = nemsisRepositories.getNemsisStateRepo(req.params.id, '3.5.0');
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
      await state.startImportDataSet(req.user, '3.5.0', dataSetVersion);
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
    const repo = nemsisRepositories.getNemsisStateRepo(req.params.id, '3.5.0');
    if (repo) {
      repo.pull();
      res.status(HttpStatus.OK).end();
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
