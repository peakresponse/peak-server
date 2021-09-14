const express = require('express');

const router = express.Router();

router.use('/agencies', require('./agencies'));
router.use('/assets', require('./assets'));
router.use('/demographics', require('./demographics'));
router.use('/employments', require('./employments'));
router.use('/facilities', require('./facilities'));
router.use('/patients', require('./patients'));
router.use('/reports', require('./reports'));
router.use('/responders', require('./responders'));
router.use('/scenes', require('./scenes'));
router.use('/states', require('./states'));
router.use('/users', require('./users'));
router.use('/utils', require('./utils'));

module.exports = router;
