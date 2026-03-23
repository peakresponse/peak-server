const express = require('express');
const fs = require('fs');
const path = require('path');

const models = require('../models');

const { Roles } = models.Employment;
const interceptors = require('./interceptors');

const router = express.Router();

let designWebpackStats;
let adminWebpackStats;
let authWebpackStats;
let onboardingWebpackStats;
let appWebpackStats;
let guidesWebpackStats;

function getDesignWebpackStats() {
  if (!designWebpackStats || process.env.NODE_ENV !== 'production') {
    designWebpackStats = JSON.parse(fs.readFileSync(path.join(__dirname, '../angular/projects/design/webpack-stats.json')));
  }
  return designWebpackStats;
}

function getAdminWebpackStats() {
  if (!adminWebpackStats || process.env.NODE_ENV !== 'production') {
    adminWebpackStats = JSON.parse(fs.readFileSync(path.join(__dirname, '../angular/projects/admin/webpack-stats.json')));
  }
  return adminWebpackStats;
}

function getAuthWebpackStats() {
  if (!authWebpackStats || process.env.NODE_ENV !== 'production') {
    authWebpackStats = JSON.parse(fs.readFileSync(path.join(__dirname, '../angular/projects/auth/webpack-stats.json')));
  }
  return authWebpackStats;
}

function getOnboardingWebpackStats() {
  if (!onboardingWebpackStats || process.env.NODE_ENV !== 'production') {
    onboardingWebpackStats = JSON.parse(fs.readFileSync(path.join(__dirname, '../angular/projects/onboarding/webpack-stats.json')));
  }
  return onboardingWebpackStats;
}

function getAppWebpackStats() {
  if (!appWebpackStats || process.env.NODE_ENV !== 'production') {
    appWebpackStats = JSON.parse(fs.readFileSync(path.join(__dirname, '../angular/projects/app/webpack-stats.json')));
  }
  return appWebpackStats;
}

function getGuidesWebpackStats() {
  if (!guidesWebpackStats || process.env.NODE_ENV !== 'production') {
    guidesWebpackStats = JSON.parse(fs.readFileSync(path.join(__dirname, '../angular/projects/guides/webpack-stats.json')));
  }
  return guidesWebpackStats;
}

if (process.env.NODE_ENV !== 'production') {
  router.get('/design(/*)?', (req, res) => {
    res.locals.webpackStats = getDesignWebpackStats();
    res.render('angular/index', {
      title: 'design.title',
      baseHref: '/design',
      elementRoot: 'design-root',
      environment: {},
      layout: 'angular/layout',
    });
  });
}

router.get(
  '/admin(/*)?',
  (req, res, next) => {
    if (!req.user) {
      interceptors.sendErrorUnauthorized(req, res);
      return;
    }
    if (!req.user.isAdmin) {
      interceptors.requireAgency(Roles.ADMIN_ROLES)(req, res, next);
    } else {
      next();
    }
  },
  (req, res) => {
    res.locals.designWebpackStats = getDesignWebpackStats();
    res.locals.webpackStats = getAdminWebpackStats();
    res.render('angular/index', {
      title: 'admin.title',
      baseHref: '/admin',
      elementRoot: 'admin-root',
      environment: {},
      layout: 'angular/layout',
    });
  },
);

router.get('/auth(/*)?', (req, res) => {
  req.logout(() => {
    res.locals.designWebpackStats = getDesignWebpackStats();
    res.locals.webpackStats = getAuthWebpackStats();
    res.render('angular/index', {
      title: 'auth.title',
      baseHref: '/auth',
      elementRoot: 'auth-root',
      environment: {},
      layout: 'angular/layout',
    });
  });
});

router.get('/sign-up(/*)?', (req, res) => {
  res.locals.designWebpackStats = getDesignWebpackStats();
  res.locals.webpackStats = getOnboardingWebpackStats();
  res.render('angular/index', {
    title: 'onboarding.title',
    baseHref: '/sign-up',
    elementRoot: 'onboarding-root',
    environment: {
      BASE_HOST: process.env.BASE_HOST,
      MARKETING_ENABLED: process.env.MARKETING_ENABLED,
    },
    layout: 'angular/layout',
  });
});

router.get('/guides(/*)?', (req, res) => {
  res.locals.designWebpackStats = getDesignWebpackStats();
  res.locals.webpackStats = getGuidesWebpackStats();
  res.render('angular/index', {
    title: 'guides.title',
    baseHref: '/guides',
    elementRoot: 'guides-root',
    environment: {},
    layout: 'angular/layout',
  });
});

router.get('/*', interceptors.requireLogin, (req, res) => {
  res.locals.designWebpackStats = getDesignWebpackStats();
  res.locals.webpackStats = getAppWebpackStats();
  res.render('angular/index', {
    title: 'app.title',
    baseHref: '/',
    elementRoot: 'app-root',
    environment: {
      GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
    },
    layout: 'angular/layout',
  });
});

module.exports = router;
