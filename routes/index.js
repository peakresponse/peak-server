'use strict';

const express = require('express');
const router = express.Router();
const models = require('../models');


router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/pincodes', function(req, res, next) {
  res.render('pincodes', {
    Patient: models.Patient,
    seed: req.query.seed || 1,
    count: req.query.count || 20
  });
});

router.get('/pincodes2', function(req, res, next) {
  res.render('pincodes2', {
    Patient: models.Patient,
    seed: req.query.seed || 1,
    count: req.query.count || 20
  });
});

router.get('/logout', function(req,res,next){
  req.logout();
  req.flash('info', 'You have been logged out.');
  res.redirect('/');
});

module.exports = router;
