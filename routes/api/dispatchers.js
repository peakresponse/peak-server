const express = require('express');
const HttpStatus = require('http-status-codes');
const _ = require('lodash');
const { Op } = require('sequelize');

const models = require('../../models');
const helpers = require('../helpers');
const interceptors = require('../interceptors');

const router = express.Router();

router.get(
  '/',
  interceptors.requireAdmin(),
  helpers.async(async (req, res) => {
    const page = req.query.page || 1;
    const options = {
      page,
      include: ['user'],
      order: [
        ['user', 'lastName', 'ASC'],
        ['user', 'firstName', 'ASC'],
      ],
    };
    const conditions = [];
    if (req.query.search && req.query.search !== '') {
      conditions.push({ name: { [Op.iLike]: `%${req.query.search.trim()}%` } });
    }
    if (req.query.psapId && req.query.psapId !== '') {
      conditions.push({
        psapId: req.query.psapId,
      });
    }
    if (conditions.length > 0) {
      options.where = {
        [Op.and]: conditions,
      };
    }
    const { docs, pages, total } = await models.Dispatcher.paginate(options);
    helpers.setPaginationHeaders(req, res, page, pages, total);
    res.json(docs.map((r) => r.toJSON()));
  })
);

router.post(
  '/',
  interceptors.requireAdmin(),
  helpers.async(async (req, res) => {
    const data = _.pick(req.body, ['psapId', 'userId', 'callSign']);
    data.createdById = req.user.id;
    data.updatedById = req.user.id;
    const dispatcher = await models.Dispatcher.create(data);
    res.status(HttpStatus.CREATED).json(dispatcher.toJSON());
  })
);

router.get(
  '/:id',
  interceptors.requireAdmin(),
  helpers.async(async (req, res) => {
    const dispatcher = await models.Dispatcher.findByPk(req.params.id, {
      include: ['user'],
    });
    if (dispatcher) {
      res.json(dispatcher.toJSON());
    } else {
      res.send(HttpStatus.NOT_FOUND).end();
    }
  })
);

router.patch(
  '/:id',
  interceptors.requireAdmin(),
  helpers.async(async (req, res) => {
    const dispatcher = await models.Dispatcher.findByPk(req.params.id, {
      include: ['user'],
    });
    if (dispatcher) {
      await dispatcher.update(_.pick(req.body, ['callSign']));
      res.json(dispatcher.toJSON());
    } else {
      res.send(HttpStatus.NOT_FOUND).end();
    }
  })
);

module.exports = router;
