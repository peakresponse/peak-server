const express = require('express');

const models = require('../../../models');
const base = require('./base');

const router = express.Router();

base.addAllRoutes(router, models.Facility, {
  index: {
    order: [
      ['type', 'ASC'],
      ['name', 'ASC'],
      ['location_code', 'ASC'],
    ],
  },
});

module.exports = router;
