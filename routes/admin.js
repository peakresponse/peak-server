const express = require('express');
const router = express.Router();
const fs = require('fs');

const interceptors = require('./interceptors');

/* GET admin SPA index file */
router.get('/*', interceptors.requireLogin(), function(req, res, next) {
  res.render('admin/index', {
    layout: 'admin/layout'
  });
});

module.exports = router;
