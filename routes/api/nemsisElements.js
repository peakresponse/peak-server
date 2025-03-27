const express = require('express');
const { StatusCodes } = require('http-status-codes');

const helpers = require('../helpers');
const interceptors = require('../interceptors');
const models = require('../../models');

const router = express.Router();

router.get(
  '/',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    const { nemsisVersion, page = '1' } = req.query;
    const options = {
      page,
      order: [['lft', 'ASC']],
      where: {
        nemsisVersion,
      },
    };
    const { docs, pages, total } = await models.NemsisElement.paginate(options);
    helpers.setPaginationHeaders(req, res, page, pages, total);
    res.json(docs.map((r) => r.toJSON()));
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
