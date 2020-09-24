const express = require('express');
const HttpStatus = require('http-status-codes');

const models = require('../models');

const interceptors = require('./interceptors');

const router = express.Router();

/* GET the login form */
router.get('/', (req, res) => {
  req.logout();
  res.render('login/new', {
    redirectURI: req.query.redirectURI,
  });
});

/* POST to submit login and password */
router.post('/', (req, res, next) => {
  interceptors.passport.authenticate('local', async (err, user) => {
    /// check for unexpected errors and pass through...
    if (err) {
      next(err);
      return;
    }
    try {
      /// check if successfully logged in
      if (!user) throw HttpStatus.UNAUTHORIZED;
      if (req.agency) {
        /// check if user is actively employed in the agency, if not a site admin
        if (!user.isAdmin) {
          const employment = await models.Employment.findOne({
            where: { agencyId: req.agency.id, userId: user.id },
          });
          if (!employment || !employment.isActive) throw HttpStatus.FORBIDDEN;
        }
        req.agencies = [req.agency];
      } else if (!user.isAdmin) {
        /// check if user is a site admin- if not, check for an active agency employment
        const employments = (
          await models.Employment.findAll({
            where: { userId: user.id },
            include: [{ model: models.Agency, as: 'agency' }],
          })
        ).filter((e) => e.isActive);
        /// if none, block from login
        if (employments.length === 0) {
          throw HttpStatus.FORBIDDEN;
        }
        /// else, collect agencies
        req.agencies = employments.map((e) => e.agency);
      }
      req.logIn(user, (logInErr) => {
        if (logInErr) {
          next(logInErr);
          return;
        }
        /// handle json xhr response
        if (req.header('Content-Type') === 'application/json') {
          const data = {
            agencies: (req.agencies || []).map((a) => a.toJSON()),
          };
          res.status(HttpStatus.OK).json(data);
          return;
        }
        /// handle web login response
        let redirectURI = '/';
        if (req.body.redirectURI && req.body.redirectURI !== '') {
          redirectURI = req.body.redirectURI;
        }
        if (!req.agency && req.agencies?.length > 0) {
          if (req.agencies.length === 1) {
            redirectURI = `${req.agencies[0].baseUrl}${redirectURI}`;
          } else {
            /// TODO: redirect to an agency selection page
          }
        }
        res.redirect(redirectURI);
      });
    } catch (status) {
      /// handle json xhr response
      if (req.header('Content-Type') === 'application/json') {
        res.status(status).end();
        return;
      }
      /// handle web login response
      switch (status) {
        case HttpStatus.UNAUTHORIZED:
          res.locals.errors = [
            { path: 'email', message: null },
            { path: 'password', message: res.__('login.new.invalid') },
          ];
          break;
        case HttpStatus.FORBIDDEN:
          res.locals.errors = [
            { path: 'email', message: res.__('login.new.forbidden') },
          ];
          break;
        default:
          break;
      }
      res.status(status).render('login/new', {
        email: req.body.email,
        redirectURI: req.body.redirectURI,
      });
    }
  })(req, res);
});

module.exports = router;
