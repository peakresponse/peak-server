const express = require('express');

const models = require('../../../models');
const base = require('./base');

const router = express.Router();

base.addAllRoutes(router, models.Vehicle, {
  index: {
    order: [
      ['type', 'ASC'],
      ['number', 'ASC'],
      ['vin', 'ASC'],
      ['call_sign', 'ASC'],
    ],
  },
});

module.exports = router;
