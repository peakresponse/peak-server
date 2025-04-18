const express = require('express');
const { StatusCodes } = require('http-status-codes');
const _ = require('lodash');

const models = require('../../models');

const helpers = require('../helpers');
const interceptors = require('../interceptors');

const router = express.Router();

router.get(
  '/',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    const options = {
      order: [['name', 'ASC']],
    };
    const records = await models.Interface.findAll(options);
    res.json(records.map((r) => r.toJSON()));
  }),
);

router.get(
  '/:id',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    const { id } = req.params;
    const record = await models.Interface.findByPk(id);
    if (record) {
      res.json(record.toJSON());
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  }),
);

router.post(
  '/',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    const record = models.Interface.build(_.pick(req.body, ['minAppVersion', 'nemsisVersion', 'dataSet', 'name']));
    record.createdById = req.user.id;
    record.updatedById = req.user.id;
    await record.save();
    res.status(StatusCodes.CREATED).json(record.toJSON());
  }),
);

router.patch(
  '/:id',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    let record;
    await models.sequelize.transaction(async (transaction) => {
      record = await models.Interface.findByPk(req.params.id, { transaction });
      if (record) {
        record.set(_.pick(req.body, ['minAppVersion', 'nemsisVersion', 'dataSet', 'name']));
        record.updatedById = req.user.id;
        await record.save({ transaction });
      }
    });
    if (record) {
      res.json(record.toJSON());
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  }),
);

router.delete(
  '/:id',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    let record;
    await models.sequelize.transaction(async (transaction) => {
      record = await models.Interface.findByPk(req.params.id, { transaction });
      if (record) {
        await record.destroy({ transaction });
      }
    });
    if (record) {
      res.json(record.toJSON());
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  }),
);

module.exports = router;
