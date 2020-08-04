'use strict';

const express = require('express');

const HttpStatus = require('http-status-codes');
const models = require('../../models');
const Op = models.Sequelize.Op;

const interceptors = require('../interceptors');
const helpers = require('../helpers');

const router = express.Router();

router.get('/', helpers.async(async function(req, res, next) {
  const page = req.query.page || 1;
  const options = {
    page,
    where: {},
    include: [{model: models.State, as: 'state'}],
    order: [['name', 'ASC']]
  };
  if (req.query.search && req.query.search !== '') {
    options.where['name'] = {[Op.iLike]: `%${req.query.search.trim()}%`};
  }
  if (req.query.stateId && req.query.stateId !== '') {
    options.where['stateId'] = req.query.stateId;
  }
  const {docs, pages, total} = await models.Agency.paginate(options);
  helpers.setPaginationHeaders(req, res, page, pages, total);
  res.json(docs.map(r => r.toJSON()));
}));

router.get('/me', function(req, res, next) {
  if (!req.agency) {
    return res.status(HttpStatus.NOT_FOUND).end();
  }
  res.json(req.agency.toJSON());
});

router.get('/:id/demographic', helpers.async(async function(req, res, next) {
  /// check for a demographic agency record
  const record = await models.DemAgency.findOne({
    where: {agencyId: req.params.id}
  });
  if (record) {
    /// send back limited details only
    res.json({
      id: record.id,
      name: record.name,
      subdomain: record.subdomain,
      message: record.getLocalizedInvitationMessage(res)
    });
  } else {
    /// new send a suggested subdomain
    const agency = await models.Agency.findByPk(req.params.id);
    if (agency) {
      const subdomain = await agency.generateSubdomain();
      res.status(HttpStatus.NOT_FOUND).json({subdomain});
    } else {
      res.status(HttpStatus.UNPROCESSABLE_ENTITY).end();
    }
  }
}));

router.get('/:id', interceptors.requireLogin(), helpers.async(async function(req, res, next) {
  const record = await models.Agency.findByPk(req.params.id)
  if (record) {
    res.json(record.toJSON());
  } else {
    res.status(HttpStatus.NOT_FOUND).end();
  }
}));

module.exports = router;
