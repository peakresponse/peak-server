const express = require('express');
const HttpStatus = require('http-status-codes');

const mailer = require('../emails/mailer');
const helpers = require('./helpers');
const interceptors = require('./interceptors');

const router = express.Router();

router.get('/privacy', (req, res) => {
  res.render('privacy');
});

router.get('/terms', (req, res) => {
  res.render('terms');
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
      // don't allow spammers to use our own domain
      const domain = process.env.MARKETING_EMAIL.substring(process.env.MARKETING_EMAIL.indexOf('@'));
      if (req.body.email.indexOf(domain) >= 0) {
        res.status(HttpStatus.UNPROCESSABLE_ENTITY).end();
        return;
      }
      await mailer.send({
        template: 'contact',
        message: {
          to: process.env.MARKETING_EMAIL,
          replyTo: req.body.email,
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
