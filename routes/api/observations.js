'use strict';

const express = require('express');
const HttpStatus = require('http-status-codes');
const _ = require('lodash');

const models = require('../../models');
const wss = require('../../wss');
const interceptors = require('../interceptors');
const helpers = require('../helpers');

const router = express.Router();

router.get('/', interceptors.requireLogin, helpers.async(async function(req, res, next) {
  const records = await models.Observation.findAll({
    order: [['created_at', 'DESC']]
  });
  res.json(records.map(r => r.toJSON()));
}));

router.post('/', interceptors.requireLogin, helpers.async(async function(req, res, next) {
  const updatedAttributes = _.keys(req.body);
  _.pullAll(updatedAttributes, models.Observation.SYSTEM_ATTRIBUTES);
  const data = _.pick(req.body, updatedAttributes);
  try {
    let patient, observation;
    await models.sequelize.transaction(async function(transaction) {
      [patient,] = await models.Patient.findOrCreate({
        where: { pin: req.body.pin },
        defaults: { version: 0, priority: data.priority, createdById: req.user.id, updatedById: req.user.id },
        transaction
      });
      patient = await helpers.handleUpload(patient, 'portraitUrl', data.portraitUrl, 'observations/portrait');
      patient = await helpers.handleUpload(patient, 'audioUrl', data.audioUrl, 'observations/audio');
      //// the upload handler writes directly to the patient record, so capture any changes back into the data object
      for (let attr of ['portraitUrl', 'audioUrl']) {
        if (updatedAttributes.indexOf(attr) >= 0) {
          data[attr] = patient[attr];
        }
      }
      patient = await patient.update(_.extend({
        version: patient.version + 1,
        updatedById: req.user.id
      }, data), {
        returning: true,
        plain: true,
        transaction
      });
      observation = await models.Observation.create(_.extend({
        patientId: patient.id,
        version: patient.version,
        createdById: req.user.id,
        updatedById: req.user.id,
        updatedAttributes: updatedAttributes
      }, data), {transaction});
    });
    res.status(HttpStatus.CREATED).json(observation.toJSON());
    const patientData = JSON.stringify([patient.toJSON()]);
    wss.clients.forEach(function(ws) {
      ws.send(patientData);
    });
  } catch(error) {
    console.log(error);
    if (error.name == 'SequelizeValidationError') {
      res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        messages: error.errors
      });
    } else {
      res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}));

module.exports = router;
