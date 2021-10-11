const express = require('express');

const interceptors = require('./interceptors');

const angularRouter = require('./angular');
const apiRouter = require('./api');
const loginRouter = require('./login');
const nemsisRouter = require('./nemsis');
const passwordsRouter = require('./passwords');
const rootRouter = require('./root');
const webhooksRouter = require('./webhooks');

const router = express.Router();

router.use(interceptors.loadAgency);
router.use(interceptors.loadApiUser);

router.use('/api', apiRouter);
router.use('/webhooks', webhooksRouter);
router.use('/login', loginRouter);
router.use('/nemsis', nemsisRouter);
router.use('/passwords', passwordsRouter);
router.use('/', rootRouter);
// angular router comes last because these routes use wildcards
router.use('/', angularRouter);

module.exports = router;
