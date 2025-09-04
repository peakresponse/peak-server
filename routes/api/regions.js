const express = require('express');
const { StatusCodes } = require('http-status-codes');
const _ = require('lodash');

const models = require('../../models');

const { Roles } = models.Employment;

const helpers = require('../helpers');
const interceptors = require('../interceptors');

const router = express.Router();

router.get(
  '/',
  interceptors.requireAgency(Roles.USER),
  helpers.async(async (req, res) => {
    const page = req.query.page || 1;
    const options = {
      page,
      order: [['name', 'ASC']],
    };
    const { docs, pages, total } = await models.Region.paginate(options);
    helpers.setPaginationHeaders(req, res, page, pages, total);
    res.json(docs.map((r) => r.toJSON()));
  }),
);

router.get(
  '/:id',
  interceptors.requireAgency(Roles.USER),
  helpers.async(async (req, res) => {
    const { id } = req.params;
    const record = await models.Region.findByPk(id, {
      include: [
        { model: models.RegionAgency, as: 'regionAgencies', include: 'agency' },
        { model: models.RegionFacility, as: 'regionFacilities', include: 'facility' },
      ],
      order: [
        ['regionAgencies', 'position', 'ASC'],
        ['regionFacilities', 'position', 'ASC'],
      ],
    });
    if (record) {
      res.json(record.toJSON());
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  }),
);

router.post(
  '/',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    const record = models.Region.build(_.pick(req.body, ['name', 'routedUrl', 'routedClientId', 'routedClientSecret']));
    record.createdById = req.user.id;
    record.updatedById = req.user.id;
    await record.save();
    res.status(StatusCodes.CREATED).json(record.toJSON());
  }),
);

router.patch(
  '/:id',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    let record;
    await models.sequelize.transaction(async (transaction) => {
      record = await models.Region.findByPk(req.params.id, { transaction });
      if (record) {
        record.set(_.pick(req.body, ['name', 'routedUrl', 'routedClientId']));
        if (req.body.routedClientSecret) {
          record.routedClientSecret = req.body.routedClientSecret;
        }
        record.updatedById = req.user.id;
        await record.save({ transaction });
        if (req.body.regionAgencies) {
          const regionAgencies = await Promise.all(
            req.body.regionAgencies.map(async (ra, index) => {
              const [regionAgency, isCreated] = await models.RegionAgency.findOrCreate({
                where: {
                  regionId: record.id,
                  agencyId: ra.agency.claimedAgency?.id ?? ra.agency.id,
                },
                defaults: {
                  position: index + 1,
                  agencyName: ra.agencyName,
                  createdById: req.user.id,
                  updatedById: req.user.id,
                },
                transaction,
              });
              if (!isCreated) {
                await regionAgency.update({ position: index + 1, agencyName: ra.agencyName, updatedById: req.user.id });
              }
              return regionAgency;
            }),
          );
          await record.setRegionAgencies(regionAgencies, { transaction });
        }
        if (req.body.regionFacilities) {
          const regionFacilities = await Promise.all(
            req.body.regionFacilities.map(async (rf, index) => {
              const [regionFacility, isCreated] = await models.RegionFacility.findOrCreate({
                where: {
                  regionId: record.id,
                  facilityId: rf.facility.id,
                },
                defaults: {
                  position: index + 1,
                  facilityName: rf.facilityName,
                  createdById: req.user.id,
                  updatedById: req.user.id,
                },
                transaction,
              });
              if (!isCreated) {
                await regionFacility.update({ position: index + 1, facilityName: rf.facilityName, updatedById: req.user.id });
              }
              return regionFacility;
            }),
          );
          await record.setRegionFacilities(regionFacilities, { transaction });
        }
        record.regionAgencies = await models.RegionAgency.scope('ordered').findAll({
          include: 'agency',
          where: { regionId: record.id },
          transaction,
        });
        record.regionFacilities = await models.RegionFacility.scope('ordered').findAll({
          include: 'facility',
          where: { regionId: record.id },
          transaction,
        });
      }
    });
    if (record) {
      res.json(record.toJSON());
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  }),
);

router.delete(
  '/:id',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    let record;
    await models.sequelize.transaction(async (transaction) => {
      record = await models.Region.findByPk(req.params.id, { transaction });
      if (record) {
        await record.destroy({ transaction });
      }
    });
    if (record) {
      res.json(record.toJSON());
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  }),
);

module.exports = router;
