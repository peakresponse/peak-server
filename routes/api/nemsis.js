const express = require('express');

const nemsisPublic = require('../../lib/nemsis/public');

const helpers = require('../helpers');
const interceptors = require('../interceptors');

const router = express.Router();

router.get(
  '/',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    if (!nemsisPublic.exists) {
      await nemsisPublic.pull();
    }
    const payload = {};
    payload.versions = nemsisPublic.versions;
    payload.versionsInstalled = nemsisPublic.versionsInstalled;
    res.json(payload);
  })
);

router.post(
  '/refresh',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    await nemsisPublic.pull();
    const payload = {};
    payload.versions = nemsisPublic.versions;
    payload.versionsInstalled = nemsisPublic.versionsInstalled;
    res.json(payload);
  })
);

router.post(
  '/install',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    const repo = nemsisPublic.getNemsisPublicRepo(req.body.version);
    await repo.pull();
    const payload = {};
    payload.versions = nemsisPublic.versions;
    payload.versionsInstalled = nemsisPublic.versionsInstalled;
    res.json(payload);
  })
);

module.exports = router;
