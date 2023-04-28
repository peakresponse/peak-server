const express = require('express');

const models = require('../../../models');
const base = require('./base');

const router = express.Router();

base.addAllRoutes(router, models.Device, {
  order: [
    ['primary_type', 'ASC'],
    ['name', 'ASC'],
    ['serial_number', 'ASC'],
  ],
});

module.exports = router;
