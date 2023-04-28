const express = require('express');

const models = require('../../../models');
const base = require('./base');

const router = express.Router();

base.addAllRoutes(router, models.Contact, {
  order: [
    ['last_name', 'ASC'],
    ['first_name', 'ASC'],
    ['middle_name', 'ASC'],
  ],
});

module.exports = router;
