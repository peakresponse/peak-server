const express = require('express');

const interceptors = require('./interceptors');

const adminRouter = require('./admin');
const apiRouter = require('./api');
const authRouter = require('./auth');
const loginRouter = require('./login');
const nemsisRouter = require('./nemsis');
const onboardingRouter = require('./onboarding');
const passwordsRouter = require('./passwords');
const rootRouter = require('./root');
const webhooksRouter = require('./webhooks');

const router = express.Router();

router.use(interceptors.loadAgency);

router.use('/api', apiRouter);
router.use('/auth', authRouter);
router.use('/webhooks', webhooksRouter);
router.use('/admin', adminRouter);
router.use('/login', loginRouter);
router.use('/nemsis', nemsisRouter);
router.use('/passwords', passwordsRouter);
router.use('/sign-up', onboardingRouter);
router.use('/', rootRouter);

module.exports = router;
