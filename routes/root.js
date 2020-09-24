const express = require('express');
const HttpStatus = require('http-status-codes');

const mailer = require('../emails/mailer');
const models = require('../models');
const helpers = require('./helpers');
const interceptors = require('./interceptors');

const router = express.Router();

router.get('/pincodes', (req, res) => {
  res.render('pincodes', {
    Patient: models.Patient,
    seed: req.query.seed || 1,
    count: req.query.count || 20,
  });
});

router.get('/pincodes2', (req, res) => {
  res.render('pincodes2', {
    Patient: models.Patient,
    seed: req.query.seed || 1,
    count: req.query.count || 20,
  });
});

router.get('/logout', (req, res) => {
  req.logout();
  req.flash('info', 'You have been logged out.');
  res.redirect('/');
});

if (process.env.MARKETING_ENABLED) {
  router.post(
    '/contact-us',
    helpers.async(async (req, res) => {
      await mailer.send({
        template: 'contact',
        message: {
          to: process.env.MARKETING_EMAIL,
        },
        locals: {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          message: req.body.message,
          feedback: req.body.feedback ? 'Yes!' : 'No',
          pilot: req.body.pilot ? 'Yes!' : 'No',
        },
      });
      res.send(HttpStatus.NO_CONTENT).end();
    })
  );

  router.get('/', (req, res, next) => {
    if (req.subdomains.length > process.env.BASE_HOST.split('.').length - 2) {
      next();
    } else {
      res.render('index', { layout: false });
    }
  });
}

router.get('/*', interceptors.requireLogin(), (req, res) => {
  res.render('dashboard');
});

module.exports = router;
