const express = require('express');

const HttpStatus = require('http-status-codes');
const models = require('../../models');

const { Op } = models.Sequelize;

const helpers = require('../helpers');
const interceptors = require('../interceptors');

const router = express.Router();

router.get(
  '/',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    const page = req.query.page || 1;
    const options = {
      // page,
      // include: ['scene'],
      order: [['number', 'DESC']],
    };
    const conditions = [];
    if (req.query.search && req.query.search !== '') {
      conditions.push({ number: { [Op.iLike]: `%${req.query.search.trim()}%` } });
    }
    if (conditions.length > 0) {
      options.where = {
        [Op.and]: conditions,
      };
    }
    // manually paginate due to complex joins
    let docs;
    let pages;
    let total;
    if (req.query.vehicleId && req.query.vehicleId !== '') {
    } else {
      ({ docs, pages, total } = await models.Incident.paginateForAgency(req.agency, options));
    }
    helpers.setPaginationHeaders(req, res, page, pages, total);
    res.json(docs.map((r) => r.toJSON()));
  })
);

module.exports = router;
