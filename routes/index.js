const express = require('express');

const interceptors = require('./interceptors');

const router = express.Router();

router.use(interceptors.loadAgency);
router.use(interceptors.loadApiUser);

router.use('/api', require('./api'));
router.use('/oauth', require('./oauth'));
router.use('/webhooks', require('./webhooks'));
router.use('/login', require('./login'));
router.use('/nemsis', require('./nemsis'));
router.use('/passwords', require('./passwords'));
router.use('/', require('./root'));
// angular router comes last because these routes use wildcards
router.use('/', require('./angular'));

module.exports = router;
