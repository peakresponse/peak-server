const express = require('express');

const router = express.Router();

const interceptors = require('./interceptors');

/* GET admin SPA index file */
router.get('/*', interceptors.requireLogin(), (req, res) => {
  res.render('admin/index', {
    layout: 'admin/layout',
  });
});

module.exports = router;
