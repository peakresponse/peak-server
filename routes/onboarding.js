const express = require('express');

const router = express.Router();

/* GET onboarding SPA index file */
router.get('/*', (req, res) => {
  res.render('onboarding');
});

module.exports = router;
