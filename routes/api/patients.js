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

module.exports = router;
