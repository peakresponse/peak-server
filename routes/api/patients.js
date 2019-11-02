'use strict';

const express = require('express');
const router = express.Router();
const models = require('../../models');
const interceptors = require('../interceptors');
const helpers = require('../helpers');
const _ = require('lodash');

router.get('/', interceptors.requireLogin, function(req, res, next) {
  models.Patient.findAll({
    order: [['priority', 'ASC'], ['updated_at', 'ASC']]
  }).then(function(records) {
    res.json(records.map(r => r.toJSON()));
  });
});

router.get('/:id', interceptors.requireAdmin, function(req, res, next) {
  models.Patient.findByPk(req.params.id).then(function(record) {
    if (record) {
      res.json(record.toJSON());
    } else {
      models.Patient.findOne({where: {pin: req.params.id}}).then(function(record) {
        if (record) {
          res.json(record.toJSON());
        } else {
          res.sendStatus(404);
        }
      });
    }
  }).catch(function(error) {
    res.sendStatus(500);
  });
});

module.exports = router;
