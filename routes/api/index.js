const express = require('express');

const router = express.Router();

router.use('/agencies', require('./agencies'));
router.use('/assets', require('./assets'));
router.use('/assignments', require('./assignments'));
router.use('/cities', require('./cities'));
router.use('/clients', require('./clients'));
router.use('/counties', require('./counties'));
router.use('/demographics', require('./demographics'));
router.use('/dispatchers', require('./dispatchers'));
router.use('/employments', require('./employments'));
router.use('/exports/logs', require('./exportLogs'));
router.use('/exports/triggers', require('./exportTriggers'));
router.use('/exports', require('./exports'));
router.use('/facilities', require('./facilities'));
router.use('/forms', require('./forms'));
router.use('/guides/items', require('./guideItems'));
router.use('/guides/sections', require('./guideSections'));
router.use('/guides', require('./guides'));
router.use('/incidents', require('./incidents'));
router.use('/lists', require('./lists'));
router.use('/nemsis/schematrons', require('./nemsisSchematrons'));
router.use('/nemsis/state-data-sets', require('./nemsisStateDataSets'));
router.use('/nemsis', require('./nemsis'));
router.use('/psaps', require('./psaps'));
router.use('/regions', require('./regions'));
router.use('/reports', require('./reports'));
router.use('/scenes', require('./scenes'));
router.use('/states', require('./states'));
router.use('/users', require('./users'));
router.use('/utils', require('./utils'));
router.use('/vehicles', require('./vehicles'));
router.use('/versions', require('./versions'));

module.exports = router;
