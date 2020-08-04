'use strict';

const express = require('express');
const HttpStatus = require('http-status-codes');
const _ = require('lodash');

const models = require('../../models');
const helpers = require('../helpers');
const interceptors = require('../interceptors');

const router = express.Router();

router.get('/', interceptors.requireLogin(), helpers.async(async function(req, res, next) {
  const records = await models.Patient.findAll({
    order: [['priority', 'ASC'], ['updated_at', 'ASC']],
    include: [
      {model: models.Agency, as: 'transportAgency'},
      {model: models.Facility, as: 'transportFacility'},
    ]
  });
  /// reduce payload size by only including a dependency on its first reference
  const agencies = [];
  const facilities = [];
  res.json(records.map(r => {
    const data = r.toJSON();
    if (r.transportAgencyId) {
      if (!agencies.includes(r.transportAgencyId)) {
        agencies.push(r.transportAgencyId);
      } else {
        delete data.transportAgency;
      }
    }
    if (r.transportFacilityId) {
      if (!facilities.includes(r.transportFacilityId)) {
        facilities.push(r.transportFacilityId);
      } else {
        delete data.transportFacility;
      }
    }
    return data;
  }));
}));

router.get('/:id', interceptors.requireLogin(), helpers.async(async function(req, res, next) {
  let record = await models.Patient.findByPk(req.params.id, {
    include: [
      {model: models.Agency, as: 'transportAgency'},
      {model: models.Facility, as: 'transportFacility'},
      {model: models.Observation, as: 'observations'}
    ]
  })
  if (!record) {
    record = await models.Patient.findOne({
      where: {pin: req.params.id},
      include: [
        {model: models.Agency, as: 'transportAgency'},
        {model: models.Facility, as: 'transportFacility'},
        {model: models.Observation, as: 'observations'}
      ]
    });
  }
  if (record) {
    const json = record.toJSON();
    json.observations = record.observations.map(o => o.toJSON());
    res.json(json);
  } else {
    res.status(HttpStatus.NOT_FOUND).end();
  }
}));

module.exports = router;
