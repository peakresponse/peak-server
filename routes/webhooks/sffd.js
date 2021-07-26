const express = require('express');
const HttpStatus = require('http-status-codes');

const models = require('../../models');
const interceptors = require('../interceptors');

const router = express.Router();

const UNIT_SFFD_REGEX = /^\d+$/;
const UNIT_AM_REGEX = /^AM\d+$/;
const UNIT_KM_REGEX = /^KM\d+$/;

router.post('/cad', interceptors.requireAgency(), async (req, res) => {
  if (req.agency.stateUniqueId !== 'S38-50827') {
    res.status(HttpStatus.FORBIDDEN).end();
  }
  const data = req.body;
  if (!Array.isArray(data)) {
    return;
  }
  await models.sequelize.transaction(async (transaction) => {
    const sffd = req.agency;
    const vehicles = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const record of data) {
      const { UNIT, INC_NO /* , DISPATCH_DTTM */ } = record;
      // skip records with no incident number
      if (!INC_NO) {
        // eslint-disable-next-line no-continue
        continue;
      }
      if (!vehicles[UNIT]) {
        let org = null;
        if (UNIT_SFFD_REGEX.test(UNIT)) {
          org = sffd;
        } else if (UNIT_AM_REGEX.test(UNIT)) {
          // noop
        } else if (UNIT_KM_REGEX.test(UNIT)) {
          // noop
        }
        if (org) {
          // eslint-disable-next-line no-await-in-loop
          const [vehicle] = await models.Vehicle.findOrCreate({
            where: {
              createdByAgencyId: org.id,
              number: UNIT,
            },
            defaults: {
              createdById: req.user.id,
              updatedById: req.user.id,
            },
            transaction,
          });
          vehicles[UNIT] = vehicle;
        }
      }
    }
  });
  res.status(HttpStatus.OK).end();
});

module.exports = router;
