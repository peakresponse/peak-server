'use strict';

const express = require('express');
const HttpStatus = require('http-status-codes');

const models = require('../../../models');
const helpers = require('../../helpers');
const interceptors = require('../../interceptors');

const router = express.Router();

router.get('/', interceptors.requireAgency(), helpers.async(async function(req, res, next) {
  res.json({
    dAgency: req.agency.data
  });
}));

router.put('/', interceptors.requireAgency(), helpers.async(async function(req, res, next) {
  await req.agency.update({data: req.body});
  if (req.agency.isValid) {
    res.status(HttpStatus.NO_CONTENT).end();
  } else {
    throw req.agency.validationError;
  }
}));

module.exports = router;
