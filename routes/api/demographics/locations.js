const express = require('express');

const models = require('../../../models');
const base = require('./base');

const router = express.Router();

base.addAllRoutes(router, models.Location, {
  index: {
    order: [
      ['type', 'ASC'],
      ['name', 'ASC'],
      ['number', 'ASC'],
    ],
  },
});

module.exports = router;
