const express = require('express');
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');

const helpers = require('../helpers');
const interceptors = require('../interceptors');
const models = require('../../models');

const router = express.Router();

router.get(
  '/',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    const { nemsisVersion, page = '1', search } = req.query;
    const options = {
      page,
      order: [['lft', 'ASC']],
      where: {
        nemsisVersion,
      },
    };
    if (search) {
      options.where[Op.or] = {
        name: {
          [Op.iLike]: `%${search}%`,
        },
        displayName: {
          [Op.iLike]: `%${search}%`,
        },
      };
    }
    const { docs, pages, total } = await models.NemsisElement.paginate(options);
    helpers.setPaginationHeaders(req, res, page, pages, total);
    res.json(docs.map((r) => r.toJSON()));
  }),
);

router.get(
  '/:id',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    const { id } = req.params;
    const record = await models.NemsisElement.findByPk(id);
    if (record) {
      res.json(record.toJSON());
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  }),
);

router.post(
  '/import',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    await models.NemsisElement.import(req.body.nemsisVersion);
    res.status(StatusCodes.OK).end();
  }),
);
module.exports = router;
