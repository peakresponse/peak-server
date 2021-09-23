const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

/* GET onboarding SPA index file */
router.get('/*', (req, res) => {
  res.locals.designWebpackStats = JSON.parse(fs.readFileSync(path.join(__dirname, '../angular/projects/design/webpack-stats.json')));
  res.locals.webpackStats = JSON.parse(fs.readFileSync(path.join(__dirname, '../angular/projects/onboarding/webpack-stats.json')));
  res.render('onboarding/index', {
    layout: 'onboarding/layout',
  });
});

module.exports = router;
