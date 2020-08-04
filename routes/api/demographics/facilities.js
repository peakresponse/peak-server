'use strict';

const express = require('express');
const HttpStatus = require('http-status-codes');

const models = require('../../../models');
const helpers = require('../../helpers');
const interceptors = require('../../interceptors');

const router = express.Router();

router.get('/', interceptors.requireAgency(), helpers.async(async function(req, res, next) {
  const page = req.query.page || 1
  const {docs, pages, total} = await models.DemFacility.paginate({
    page: page,
    where: {agencyId: req.agency.id},
    order: [['type', 'ASC'], ['name', 'ASC'], ['location_code', 'ASC']]
  });
  helpers.setPaginationHeaders(req, res, page, pages, total);
  res.json({
    dFacility: {
      'dFacilityGroup': docs.map(d => d.data)
    }
  });
}));

router.post('/', interceptors.requireAgency(), helpers.async(async function(req, res, next) {
  const record = await models.DemFacility.create({
    agencyId: req.agency.id,
    data: req.body,
    createdById: req.user.id,
    updatedById: req.user.id
  });
  if (record.isValid) {
    res.status(HttpStatus.CREATED).json(record.data);
  } else {
    throw record.validationError;
  }
}));

router.put('/:id', interceptors.requireAgency(), helpers.async(async function(req, res, next) {
  let record = await models.DemFacility.findOne({
    where: {
      id: req.params.id,
      agencyId: req.agency.id
    }
  });
  if (record) {
    record = await record.update({data: req.body});
    if (record.isValid) {
      res.status(HttpStatus.NO_CONTENT).end();
    } else {
      throw record.validationError;
    }
  } else {
    res.status(HttpStatus.NOT_FOUND).end();
  }
}));

module.exports = router;
