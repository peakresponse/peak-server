const express = require('express');
const HttpStatus = require('http-status-codes');

const mailer = require('../emails/mailer');
const helpers = require('./helpers');
const interceptors = require('./interceptors');

const router = express.Router();

router.get('/privacy', (req, res) => {
  res.render('privacy');
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
      res.status(HttpStatus.NO_CONTENT).end();
    })
  );

  router.get('/', (req, res, next) => {
    if (req.subdomains.length > process.env.BASE_HOST.split('.').length - 2) {
      next();
    } else {
      res.render('index');
    }
  });
}

router.get('/*', interceptors.requireLogin(), (req, res) => {
  res.render('dashboard');
});

module.exports = router;
