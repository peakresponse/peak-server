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
    const { search, lat, lng, page = '1' } = req.query;
    const options = {
      where: {
        featureClass: ['Civil', 'Populated Place', 'Military'],
      },
      order: [['featureName', 'ASC']],
      page,
    };
    if (search) {
      options.where.featureName = {
        [models.Sequelize.Op.iLike]: `%${search}%`,
      };
    }
    let docs;
    let pages;
    let total;
    if (lat && lng) {
      ({ docs, pages, total } = await models.City.findNear(lat, lng, options));
    } else {
      ({ docs, pages, total } = await models.City.paginate(options));
    }
    helpers.setPaginationHeaders(req, res, page, pages, total);
    res.json(docs.map((r) => r.toJSON()));
  })
);

router.get(
  '/:id',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    const record = await models.City.findByPk(req.params.id);
    if (record) {
      res.json(record.toJSON());
    } else {
      res.status(HttpStatus.NOT_FOUND).end();
    }
  })
);

module.exports = router;
