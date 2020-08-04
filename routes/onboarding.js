const express = require('express');
const router = express.Router();
const fs = require('fs');

/* GET onboarding SPA index file */
router.get('/*', function(req, res, next) {
  res.render('onboarding');
});

module.exports = router;
