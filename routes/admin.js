const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const interceptors = require('./interceptors');

/* GET admin SPA index file */
router.get('/*', interceptors.requireLogin(), (req, res) => {
  res.locals.designWebpackStats = JSON.parse(fs.readFileSync(path.join(__dirname, '../angular/projects/design/webpack-stats.json')));
  res.locals.webpackStats = JSON.parse(fs.readFileSync(path.join(__dirname, '../angular/projects/admin/webpack-stats.json')));
  res.render('admin/index', {
    layout: 'admin/layout',
  });
});

module.exports = router;
