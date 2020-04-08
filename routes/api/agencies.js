'use strict';

const express = require('express');

const models = require('../../models');
const Op = models.Sequelize.Op;

const interceptors = require('../interceptors');
const helpers = require('../helpers');

const router = express.Router();

router.get('/', interceptors.requireLogin, helpers.async(async function(req, res, next) {
  const page = req.query.page || 1;
  const options = {
    page,
    order: [['name', 'ASC']],
    include: [{model: models.State, as: 'state'}]
  };
  if (req.query.search && req.query.search !== '') {
    options.where = options.where || {};
    options.where['name'] = {[Op.iLike]: `%${req.query.search.trim()}%`};
  }
  const {docs, pages, total} = await models.Agency.paginate(options);
  helpers.setPaginationHeaders(req, res, page, pages, total);
  res.json(docs.map(r => r.toJSON()));
}));

router.get('/:id', interceptors.requireAdmin, helpers.async(async function(req, res, next) {
  const record = await models.Agency.findByPk(req.params.id)
  if (record) {
    res.json(record.toJSON());
  } else {
    res.sendStatus(404);
  }
}));

module.exports = router;
