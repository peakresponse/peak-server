const express = require('express');
const { StatusCodes } = require('http-status-codes');

const limiter = require('../lib/limiter');
const models = require('../models');

const interceptors = require('./interceptors');

const router = express.Router();

/* GET the login form */
router.get('/', (req, res) => {
  req.logout(() => {
    res.render('login/new', {
      redirectURI: req.query.redirectURI,
    });
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
      if (!user) throw StatusCodes.UNAUTHORIZED;
      if (req.agency) {
        /// check if user is actively employed in the agency, if not a site admin
        if (!user.isAdmin) {
          const employment = await models.Employment.scope('finalOrNew').findOne({
            where: { createdByAgencyId: req.agency.id, userId: user.id },
          });
          if (!employment || !employment.isActive) throw StatusCodes.FORBIDDEN;
        }
        req.agencies = [req.agency];
      } else if (!user.isAdmin) {
        /// check if user is a site admin- if not, check for an active agency employment or psap dispatcher
        const employments = (
          await models.Employment.scope('finalOrNew').findAll({
            where: { userId: user.id },
            include: ['createdByAgency'],
          })
        ).filter((e) => e.isActive);
        /// if none, block from login
        if (employments.length === 0) {
          /// check if a dispatcher
          const dispatchers = await user.getDispatchers();
          if (dispatchers.length === 0) {
            throw StatusCodes.FORBIDDEN;
          }
        }
        /// else, collect agencies
        req.agencies = employments.map((e) => e.createdByAgency);
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
          res.status(StatusCodes.OK).json(data);
          return;
        }
        /// reset rate limit for this IP
        limiter.resetKey(req.ip);
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
        case StatusCodes.UNAUTHORIZED:
          res.locals.errors = [
            { path: 'email', message: null },
            { path: 'password', message: res.__('login.new.invalid') },
          ];
          break;
        case StatusCodes.FORBIDDEN:
          res.locals.errors = [{ path: 'email', message: res.__('login.new.forbidden') }];
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
