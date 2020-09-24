const express = require('express');
const HttpStatus = require('http-status-codes');

const helpers = require('../../helpers');
const interceptors = require('../../interceptors');

const router = express.Router();

router.get(
  '/',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    res.json({
      dAgency: req.agency.data,
    });
  })
);

router.put(
  '/',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    await req.agency.update({ data: req.body });
    if (req.agency.isValid) {
      res.status(HttpStatus.NO_CONTENT).end();
    } else {
      throw req.agency.validationError;
    }
  })
);

module.exports = router;
