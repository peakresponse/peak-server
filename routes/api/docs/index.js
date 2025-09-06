const express = require('express');

const router = express.Router();

router.use('/integration', require('./integration'));

module.exports = router;
