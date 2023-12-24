const express = require('express');
const HttpStatus = require('http-status-codes');

const models = require('../../../models');
const helpers = require('../../helpers');
const interceptors = require('../../interceptors');
const base = require('./base');

const router = express.Router();

router.post(
  '/import',
  interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
  helpers.async(async (req, res) => {
    const version = await req.agency.getOrCreateDraftVersion(req.user);
    const canonicalFacility = await models.Facility.scope('canonical').findByPk(req.body.id);
    // convert the data from sFacility (State Data Set) to dFacility (DEM Data Set)
    const data = JSON.parse(JSON.stringify(canonicalFacility.data).replace(/"sFacility\./g, '"dFacility.'));
    const record = await models.Facility.create({
      isDraft: true,
      versionId: version.id,
      canonicalFacilityId: canonicalFacility.id,
      data,
      createdByAgencyId: req.agency.id,
      createdById: req.user.id,
      updatedById: req.user.id,
    });
    res.status(HttpStatus.CREATED).json(await record.toNemsisJSON());
  }),
);

base.addAllRoutes(router, models.Facility, {
  index: {
    order: [
      ['type', 'ASC'],
      ['name', 'ASC'],
      ['location_code', 'ASC'],
    ],
  },
});

module.exports = router;
