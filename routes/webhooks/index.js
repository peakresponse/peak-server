const express = require('express');

const router = express.Router();

router.use('/hyannis', require('./hyannis'));
router.use('/sffd', require('./sffd'));

module.exports = router;
