const express = require('express');
const router = express.Router();

const agenciesRouter = require('./agencies');
const demographicsRouter = require('./demographics');
const facilitiesRouter = require('./facilities');
const observationsRouter = require('./observations');
const patientsRouter = require('./patients');
const statesRouter = require('./states');
const uploadsRouter = require('./uploads');
const usersRouter = require('./users');

router.use('/agencies', agenciesRouter);
router.use('/demographics', demographicsRouter);
router.use('/facilities', facilitiesRouter);
router.use('/observations', observationsRouter);
router.use('/patients', patientsRouter);
router.use('/states', statesRouter);
router.use('/uploads', uploadsRouter);
router.use('/users', usersRouter);

module.exports = router;
