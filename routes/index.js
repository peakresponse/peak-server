'use strict';

const express = require('express');
const router = express.Router();
const models = require('../models');
const fs = require('fs');
const interceptors = require('./interceptors');

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

router.get('/*', interceptors.requireLogin, function(req, res, next) {
  const webpackStats = JSON.parse(fs.readFileSync('./client/webpack-stats.json'));
  res.render('index', {
    webpackStats: webpackStats
  });
});

module.exports = router;
