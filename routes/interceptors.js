const createError = require('http-errors');
const { StatusCodes } = require('http-status-codes');
const passport = require('passport');
const passportLocal = require('passport-local');

const models = require('../models');
const oauth = require('../lib/oauth');

const { Op } = models.Sequelize;

/* eslint-disable no-param-reassign, no-underscore-dangle */
function SessionManager(options, serializeUser) {
  if (typeof options === 'function') {
    serializeUser = options;
    options = undefined;
  }
  options = options || {};
  this._key = options.key || 'passport';
  this._serializeUser = serializeUser;
}

SessionManager.prototype.logIn = function logIn(req, user, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }
  options = options || {};
  const self = this;
  this._serializeUser(user, req, (err, obj) => {
    if (err) {
      cb(err);
      return;
    }
    if (!req.session) {
      req.session = {};
    }
    if (!req.session[self._key]) {
      req.session[self._key] = {};
    }
    req.session[self._key].user = obj;
    cb();
  });
};

SessionManager.prototype.logOut = function logOut(req, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }
  options = options || {};
  if (req.session && req.session[this._key]) {
    delete req.session[this._key].user;
  }
  if (cb) {
    cb();
  }
};
/* eslint-enable no-param-reassign */

passport._sm = new SessionManager(passport.serializeUser.bind(passport));

passport.use(
  new passportLocal.Strategy(
    {
      usernameField: 'email',
    },
    async (email, password, done) => {
      try {
        const user = await models.User.findOne({ where: { email } });
        const result = await user.authenticate(password);
        if (result) {
          return done(null, user);
        }
        return done(null, false, { message: 'Invalid password' });
      } catch (err) {
        return done(null, false, err);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await models.User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(null, false);
  }
});

function getAgencySubdomain(req) {
  if (req.subdomains.length > 0) {
    return req.subdomains[0].trim();
  }
  if (req.header('X-Agency-Subdomain')) {
    return req.header('X-Agency-Subdomain').trim();
  }
  return null;
}

async function loadAgency(req, res, next) {
  /// load demographic, if on subdomain
  const subdomain = getAgencySubdomain(req);
  if (subdomain) {
    req.agency = await models.Agency.findOne({
      where: { subdomain: { [Op.iLike]: subdomain }, isDraft: false },
    });
    if (!req.agency) {
      if (req.accepts('html')) {
        next(createError(StatusCodes.NOT_FOUND));
      } else {
        res.status(StatusCodes.NOT_FOUND).end();
      }
    }
  }
  next();
}

async function loadApiUser(req, res, next) {
  if (!req.user && req.headers.authorization) {
    // DEPRECATED: attempt api key authentication via bearer token
    const m = req.headers.authorization.match(/Bearer (.+)/);
    if (m) {
      req.user = await models.User.findOne({
        where: {
          apiKey: m[1],
        },
      });
    }
    if (!req.user) {
      try {
        const request = new oauth.Request(req);
        const response = new oauth.Response(res);
        const token = await oauth.server.authenticate(request, response);
        req.user = token?.user;
      } catch {
        // noop
      }
    }
  }
  next();
}

function sendErrorUnauthorized(req, res) {
  if (req.accepts('html')) {
    req.flash('error', 'You must log in to view the page you visited.');
    res.redirect(`/auth/login?redirectURI=${encodeURIComponent(req.originalUrl)}`);
  } else {
    res.status(StatusCodes.UNAUTHORIZED).end();
  }
}

function sendErrorForbidden(req, res) {
  if (req.accepts('html')) {
    req.flash('error', 'You are not allowed to view the page you visited.');
    res.redirect(`/`);
  } else {
    res.status(StatusCodes.FORBIDDEN).end();
  }
}

async function requireLogin(req, res, next, role) {
  if (req.user) {
    let isAllowed = true;
    if (!req.user.isAdmin && req.agency) {
      /// check for active employment
      const employment = await req.user.isEmployedBy(req.agency);
      isAllowed = employment !== null;
      /// check for role, if any
      if (isAllowed && role) {
        if (Array.isArray(role)) {
          isAllowed = employment.isOwner || role.filter((r) => employment.roles.includes(r)).length > 0;
        } else {
          isAllowed = employment.isOwner || employment.roles.includes(role);
        }
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

function requireAgency(role) {
  return (req, res, next) => {
    /// require that this request be on an agency subdomain...
    if (!req.agency && !req.user?.isAdmin) {
      sendErrorForbidden(req, res);
    } else {
      /// ...by an active employed user
      requireLogin(req, res, next, role);
    }
  };
}

function requireAdmin(req, res, next) {
  /// only allow site admins to continue
  if (req.user) {
    if (req.user.isAdmin) {
      next();
    } else {
      sendErrorForbidden(req, res);
    }
  } else {
    sendErrorUnauthorized(req, res);
  }
}

module.exports = {
  passport,
  loadAgency,
  loadApiUser,
  sendErrorForbidden,
  sendErrorUnauthorized,
  requireLogin(req, res, next) {
    requireLogin(req, res, next, undefined);
  },
  requireAgency,
  requireAdmin,
};
