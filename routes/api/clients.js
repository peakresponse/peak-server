const express = require('express');
const { StatusCodes } = require('http-status-codes');
const _ = require('lodash');
const { Op } = require('sequelize');

const models = require('../../models');

const helpers = require('../helpers');
const interceptors = require('../interceptors');

const router = express.Router();

router.get(
  '/',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    const page = req.query.page || 1;
    const options = {
      page,
      order: [['name', 'ASC']],
    };
    const conditions = [];
    if (req.query.search && req.query.search !== '') {
      conditions.push({ name: { [Op.iLike]: `%${req.query.search.trim()}%` } });
    }
    if (conditions.length > 0) {
      options.where = {
        [Op.and]: conditions,
      };
    }
    const { docs, pages, total } = await models.Client.paginate(options);
    helpers.setPaginationHeaders(req, res, page, pages, total);
    res.json(docs.map((r) => r.toJSON()));
  }),
);

router.post(
  '/',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    const client = models.Client.build(_.pick(req.body, ['name', 'redirectUri', 'userId']));
    const { clientSecret } = client.generateClientIdAndSecret();
    client.createdById = req.user.id;
    client.updatedById = req.user.id;
    await client.save();
    const data = client.toJSON();
    data.clientSecret = clientSecret;
    res.status(StatusCodes.CREATED).json(data);
  }),
);

router.get(
  '/:id',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    const client = await models.Client.findByPk(req.params.id);
    if (client) {
      res.json(client.toJSON());
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  }),
);

router.delete(
  '/:id',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    let client;
    await models.sequelize.transaction(async (transaction) => {
      client = await models.Client.findByPk(req.params.id, { transaction });
      if (client) {
        await client.destroy({ transaction });
      }
    });
    if (client) {
      res.status(StatusCodes.OK).end();
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  }),
);

router.patch(
  '/:id/regenerate',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    let client;
    let clientSecret;
    await models.sequelize.transaction(async (transaction) => {
      client = await models.Client.findByPk(req.params.id, { transaction });
      if (client) {
        ({ clientSecret } = client.generateClientIdAndSecret());
        client.updatedById = req.user.id;
        await client.save({ transaction });
      }
    });
    if (client) {
      const data = client.toJSON();
      data.clientSecret = clientSecret;
      res.json(data);
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  }),
);

router.patch(
  '/:id',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    let client;
    await models.sequelize.transaction(async (transaction) => {
      client = await models.Client.findByPk(req.params.id, { transaction });
      if (client) {
        const data = _.pick(req.body, ['name', 'redirectUri', 'userId']);
        data.updatedById = req.user.id;
        await client.update(data, { transaction });
      }
    });
    if (client) {
      res.json(client.toJSON());
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  }),
);

module.exports = router;
