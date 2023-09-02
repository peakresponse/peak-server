const express = require('express');
const HttpStatus = require('http-status-codes');

const models = require('../../models');
const interceptors = require('../interceptors');
const helpers = require('../helpers');

const router = express.Router();

router.get(
  '/',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    const { search, page = '1' } = req.query;
    const options = {
      where: {},
      order: [['name', 'ASC']],
      page,
    };
    if (search) {
      options.where.name = {
        [models.Sequelize.Op.iLike]: `%${search}%`,
      };
    }
    const { docs, pages, total } = await models.County.paginate(options);
    helpers.setPaginationHeaders(req, res, page, pages, total);
    res.json(docs.map((r) => r.toJSON()));
  })
);

router.get(
  '/:id',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    const record = await models.County.findByPk(req.params.id);
    if (record) {
      res.json(record.toJSON());
    } else {
      res.status(HttpStatus.NOT_FOUND).end();
    }
  })
);

module.exports = router;
