'use strict';

const express = require('express');
const router = express.Router();
const models = require('../../models');
const Op = models.Sequelize.Op;
const interceptors = require('../interceptors');
const helpers = require('../helpers');

router.get('/', interceptors.requireLogin, helpers.async(async function(req, res, next) {
  const page = req.query.page || 1;
  const options = {
    page,
    order: [['name', 'ASC']]
  };
  if (req.query.search && req.query.search !== '') {
    options.where = options.where || {};
    options.where['name'] = {[Op.iLike]: `%${req.query.search.trim()}%`};
  }
  if (req.query.type && req.query.type !== '') {
    options.where = options.where || {};
    options.where['type'] = req.query.type.trim();
  }
  let docs, pages, total;
  if (req.query.lat && req.query.lng) {
    ({docs, pages, total} = await models.Facility.findNear(req.query.lat, req.query.lng, options));
  } else {
    ({docs, pages, total} = await models.Facility.paginate(options));
  }
  helpers.setPaginationHeaders(req, res, page, pages, total);
  res.json(docs.map(d => d.toJSON()));
}));

router.get('/:id', interceptors.requireAdmin, helpers.async(async function(req, res, next) {
  const record = await models.Facility.findByPk(req.params.id)
  if (record) {
    res.json(record.toJSON());
  } else {
    res.sendStatus(404);
  }
}));

module.exports = router;
