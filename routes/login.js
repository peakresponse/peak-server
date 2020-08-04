'use strict'

const express = require('express');
const HttpStatus = require('http-status-codes');

const models = require('../models');
const Op = models.Sequelize.Op;
const interceptors = require('./interceptors');

const router = express.Router();

/* GET the login form */
router.get('/', function(req, res, next) {
  req.logout();
  res.render('login/new', {
    redirectURI: req.query.redirectURI
  });
});

/* POST to submit login and password */
router.post('/', function(req, res, next) {
  interceptors.passport.authenticate('local', async function(err, user, info) {
    /// check for unexpected errors and pass through...
    if (err) {
      return next(err);
    }
    try {
      /// check if successfully logged in
      if (!user) throw HttpStatus.UNAUTHORIZED;
      if (req.agency) {
        /// check if user is actively employed in the agency, if not a site admin
        if (!user.isAdmin) {
          const employment = await models.Employment.findOne({where: {agencyId: req.agency.id, userId: user.id}});
          if (!employment || !employment.isActive) throw HttpStatus.FORBIDDEN;
        }
      } else {
        /// check if user is a site admin
        if (!user.isAdmin) throw HttpStatus.FORBIDDEN;
      }
      req.logIn(user, function(err) {
        /// handle json xhr response
        if (req.header('Content-Type') == 'application/json') {
          return res.status(HttpStatus.OK).end();
        }
        /// handle web login response
        if (req.body.redirectURI && req.body.redirectURI != '') {
          return res.redirect(req.body.redirectURI);
        }
        res.redirect('/');
      });
    } catch (status) {
      /// handle json xhr response
      if (req.header('Content-Type') == 'application/json') {
        return res.status(status).end();
      }
      /// handle web login response
      switch (status) {
      case HttpStatus.UNAUTHORIZED:
        res.locals.errors = [{path: 'email', message: null}, {path: 'password', message: res.__('login.new.invalid')}];
        break;
      case HttpStatus.FORBIDDEN:
        res.locals.errors = [{path: 'email', message: res.__('login.new.forbidden')}];
        break;
      }
      res.status(status).render('login/new', {
        email: req.body.email,
        redirectURI: req.body.redirectURI
      });
    }
  })(req, res, next);
});

module.exports = router;
