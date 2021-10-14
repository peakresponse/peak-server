const express = require('express');

const router = express.Router();

router.use('/agencies', require('./agencies'));
router.use('/assets', require('./assets'));
router.use('/assignments', require('./assignments'));
router.use('/demographics', require('./demographics'));
router.use('/dispatchers', require('./dispatchers'));
router.use('/employments', require('./employments'));
router.use('/facilities', require('./facilities'));
router.use('/incidents', require('./incidents'));
router.use('/patients', require('./patients'));
router.use('/psaps', require('./psaps'));
router.use('/reports', require('./reports'));
router.use('/responders', require('./responders'));
router.use('/scenes', require('./scenes'));
router.use('/states', require('./states'));
router.use('/users', require('./users'));
router.use('/utils', require('./utils'));

module.exports = router;
