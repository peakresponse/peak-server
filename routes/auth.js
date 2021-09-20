const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

/* GET auth SPA index file */
router.get('/*', (req, res) => {
  res.locals.webpackStats = JSON.parse(fs.readFileSync(path.join(__dirname, '../angular/projects/auth/webpack-stats.json')));
  res.render('auth/index', {
    layout: 'auth/layout',
  });
});

module.exports = router;
