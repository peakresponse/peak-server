'use strict';

const createError = require('http-errors');
const HttpStatus = require('http-status-codes');
const passport = require('passport');
const passportLocal = require('passport-local');
const models = require('../models');
const Op = models.Sequelize.Op;

passport.use(
  new passportLocal.Strategy({
    usernameField: 'email',
  },
  async function(email, password, done) {
    try {
      const user = await models.User.findOne({where: {email: email}});
      const result = await user.authenticate(password);
      if (result) {
        return done(null, user);
      }
      return done(null, false, { message: 'Invalid password' });
    } catch (err) {
      return done(null, false, err);
    }
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  models.User.findByPk(id).then(function(user) {
    done(null, user);
  });
});

module.exports.passport = passport;

module.exports.loadAgency = async function(req, res, next) {
  /// load demographic, if on subdomain
  let agency;
  if (req.subdomains.length > 0) {
    agency = req.subdomains[0].trim();
  } else if (req.header('X-Agency-Subdomain')) {
    agency = req.header('X-Agency-Subdomain').trim();
  }
  if (agency) {
    req.agency = await models.DemAgency.findOne({
      where: {subdomain: {[Op.iLike]: agency}}
    });
    if (!req.agency) {
      if (req.accepts('html')) {
        next(createError(HttpStatus.NOT_FOUND));
      } else {
        res.status(HttpStatus.NOT_FOUND).end();
      }
    }
  }
  next();
};

function sendErrorUnauthorized(req, res) {
  if (req.accepts('html')) {
    req.flash("error", "You must log in to view the page you visited.");
    res.redirect(`/login?redirectURI=${encodeURIComponent(req.originalUrl)}`);
  } else {
    res.status(HttpStatus.UNAUTHORIZED).end();
  }
}

function sendErrorForbidden(req, res) {
  if (req.accepts('html')) {
    req.flash("error", "You are not allowed to view the page you visited.");
    res.redirect(`/`);
  } else {
    res.status(HttpStatus.FORBIDDEN).end();
  }
}

async function requireLogin(req, res, next, role) {
  if (req.user) {
    /// site admins are super users that are allow for all
    let isAllowed = req.user.isAdmin;
    if (!isAllowed && req.agency) {
      /// check for active employment
      const employment = await models.Employment.findOne({
        where: {userId: req.user.id, agencyId: req.agency.id}
      });
      isAllowed = employment && employment.isActive;
      /// check for role, if any
      if (role) {
        isAllowed = employment.isOwner || employment.roles.include(role);
      }
    }
    if (isAllowed) {
      next();
    } else {
      sendErrorForbidden(req, res);
    }
  } else {
    sendErrorUnauthorized(req, res);
  }
}

module.exports.requireLogin = function() {
  return async function(req, res, next) { 
    await requireLogin(req, res, next);
  };
};

module.exports.requireAgency = function(role) {
  return async function(req, res, next) {
    /// require that this request be on an agency subdomain...
    if (!req.agency) {
      return sendErrorForbidden(req, res);
    }
    /// ...by an active employed user
    await requireLogin(req, res, next, role);
  };
}

module.exports.requireAdmin = function() {
  return async function(req, res, next) {
    /// only allow site admins to continue
    if (req.user) {
      if (req.user.isAdmin) {
        return next();
      }
      return sendErrorForbidden(req, res);
    }
    sendErrorUnauthorized(req, res);
  };
}
