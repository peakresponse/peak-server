const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

/* GET onboarding SPA index file */
router.get('/old/*', (req, res) => {
  res.render('onboarding');
});

router.get('/*', (req, res) => {
  req.logout();
  res.locals.designWebpackStats = JSON.parse(fs.readFileSync(path.join(__dirname, '../angular/projects/design/webpack-stats.json')));
  res.locals.webpackStats = JSON.parse(fs.readFileSync(path.join(__dirname, '../angular/projects/onboarding/webpack-stats.json')));
  res.render('onboarding/index', {
    layout: 'onboarding/layout',
  });
});

module.exports = router;
