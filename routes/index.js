'use strict';

const express = require('express');
const fs = require('fs');
const HttpStatus = require('http-status-codes');

const mailer = require('../emails/mailer');
const models = require('../models');
const helpers = require('./helpers');
const interceptors = require('./interceptors');

const router = express.Router();

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

router.get('/logout', function(req,res,next) {
  req.logout();
  req.flash('info', 'You have been logged out.');
  res.redirect('/');
});

if (process.env.MARKETING_ENABLED) {
  const csrf = require('csurf')();

  router.post('/contact-us', csrf, helpers.async(async function(req, res, next) {
    await mailer.send({
      template: 'contact',
      message: {
        to: process.env.MARKETING_EMAIL
      },
      locals: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        message: req.body.message,
        feedback: req.body.feedback ? 'Yes!' : 'No',
        pilot: req.body.pilot ? 'Yes!' : 'No',
      }
    });
    res.sendStatus(HttpStatus.OK);
  }));

  router.get('/', csrf, function(req, res, next) {
    res.render('index', {
      csrfToken: req.csrfToken(),
      layout: false
    });
  });
}

router.get('/*', interceptors.requireLogin, function(req, res, next) {
  const webpackStats = JSON.parse(fs.readFileSync('./client/webpack-stats.json'));
  res.render('dashboard', {
    webpackStats: webpackStats
  });
});

module.exports = router;
