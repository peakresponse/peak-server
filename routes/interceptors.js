const createError = require('http-errors');
const HttpStatus = require('http-status-codes');
const passport = require('passport');
const passportLocal = require('passport-local');
const models = require('../models');

const { Op } = models.Sequelize;

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
    }
  )
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

module.exports.passport = passport;

function getAgencySubdomain(req) {
  if (req.subdomains.length > 0) {
    return req.subdomains[0].trim();
  }
  if (req.header('X-Agency-Subdomain')) {
    return req.header('X-Agency-Subdomain').trim();
  }
  return null;
}

module.exports.loadAgency = async (req, res, next) => {
  /// load demographic, if on subdomain
  const subdomain = getAgencySubdomain(req);
  if (subdomain) {
    req.agency = await models.Agency.findOne({
      where: { subdomain: { [Op.iLike]: subdomain } },
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
    req.flash('error', 'You must log in to view the page you visited.');
    res.redirect(`/login?redirectURI=${encodeURIComponent(req.originalUrl)}`);
  } else {
    res.status(HttpStatus.UNAUTHORIZED).end();
  }
}

function sendErrorForbidden(req, res) {
  if (req.accepts('html')) {
    req.flash('error', 'You are not allowed to view the page you visited.');
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
        where: { userId: req.user.id, agencyId: req.agency.id },
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

module.exports.requireLogin = () => {
  return async (req, res, next) => {
    await requireLogin(req, res, next);
  };
};

module.exports.requireAgency = (role) => {
  return async (req, res, next) => {
    /// require that this request be on an agency subdomain...
    if (!req.agency) {
      sendErrorForbidden(req, res);
      return;
    }
    /// ...by an active employed user
    await requireLogin(req, res, next, role);
  };
};

module.exports.requireAdmin = () => {
  return async (req, res, next) => {
    /// only allow site admins to continue
    if (req.user) {
      if (req.user.isAdmin) {
        next();
      } else {
        sendErrorForbidden(req, res);
      }
      return;
    }
    sendErrorUnauthorized(req, res);
  };
};
