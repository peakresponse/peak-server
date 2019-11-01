const express = require('express');
const router = express.Router();

const destinationsRouter = require('./destinations');
const observationsRouter = require('./observations');
const patientsRouter = require('./patients');
const transportsRouter = require('./transports');
const uploadsRouter = require('./uploads');
const usersRouter = require('./users');

router.use('/destinations', destinationsRouter);
router.use('/observations', observationsRouter);
router.use('/patients', patientsRouter);
router.use('/transports', transportsRouter);
router.use('/uploads', uploadsRouter);
router.use('/users', usersRouter);

module.exports = router;
