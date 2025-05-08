const express = require('express');
const { StatusCodes } = require('http-status-codes');
const _ = require('lodash');
const { Op } = require('sequelize');

const rollbar = require('../../lib/rollbar');
const routed = require('../../lib/routed');
const models = require('../../models');

const helpers = require('../helpers');
const interceptors = require('../interceptors');

const router = express.Router();

router.get(
  '/',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    const { page = '1', search } = req.query;
    const options = {
      page,
      where: {
        createdByAgencyId: req.agency.id,
        archivedAt: null,
      },
      include: ['city', 'county', 'state'],
      order: [['name', 'ASC']],
    };
    if (search) {
      options.where.name = {
        [Op.iLike]: `%${search.trim()}%`,
      };
    }
    const { docs, pages, total } = await models.Venue.paginate(options);
    helpers.setPaginationHeaders(req, res, page, pages, total);
    const payload = {};
    payload.City = _.uniqBy(docs.map((v) => v.city).filter(Boolean), (c) => c.id).map((c) => c.toJSON());
    payload.County = _.uniqBy(docs.map((v) => v.county).filter(Boolean), (c) => c.id).map((c) => c.toJSON());
    payload.State = _.uniqBy(docs.map((v) => v.state).filter(Boolean), (s) => s.id).map((s) => s.toJSON());
    payload.Venue = docs.map((v) => {
      const { city, county, state, ...venue } = v.toJSON();
      return venue;
    });
    res.json(payload);
  }),
);

router.post(
  '/',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    const record = await models.Venue.create({
      ..._.pick(req.body, ['name', 'type', 'address1', 'address2', 'cityId', 'countyId', 'stateId', 'zipCode', 'regionId']),
      createdById: req.user.id,
      createdByAgencyId: req.agency.id,
      updatedById: req.user.id,
    });
    // update Routed in background
    routed
      .upsertVenue(record.id)
      .then()
      .catch((err) => rollbar.error(err, { venueId: record.id }));
    return res.status(StatusCodes.CREATED).json(record.toJSON());
  }),
);

router.get(
  '/:id',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    const record = await models.Venue.findOne({
      where: {
        id: req.params.id,
        archivedAt: null,
      },
      include: ['city', 'county', 'state', 'facilities', 'region'],
      order: [['facilities', 'name', 'ASC']],
    });
    if (!record) {
      return res.status(StatusCodes.NOT_FOUND).end();
    }
    return res.json(record.toJSON());
  }),
);

router.patch(
  '/:id',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    const transaction = await models.sequelize.transaction();
    try {
      const record = await models.Venue.findOne({
        where: {
          id: req.params.id,
          archivedAt: null,
        },
        include: ['city', 'county', 'state', 'facilities', 'region'],
        order: [['facilities', 'name', 'ASC']],
        transaction,
      });
      if (!record) {
        await transaction.rollback();
        return res.status(StatusCodes.NOT_FOUND).end();
      }
      await record.update(
        {
          ..._.pick(req.body, ['name', 'type', 'address1', 'address2', 'cityId', 'countyId', 'stateId', 'zipCode', 'regionId']),
          updatedById: req.user.id,
        },
        { transaction },
      );
      await transaction.commit();
      // update Routed in background
      routed
        .upsertVenue(record.id)
        .then()
        .catch((err) => rollbar.error(err, { venueId: record.id }));
      return res.json(record.toJSON());
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }),
);

router.delete(
  '/:id',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    const transaction = await models.sequelize.transaction();
    try {
      const record = await models.Venue.findByPk(req.params.id, { transaction });
      if (!record) {
        await transaction.rollback();
        return res.status(StatusCodes.NOT_FOUND).end();
      }
      await record.update(
        {
          archivedAt: new Date(),
          updatedById: req.user.id,
        },
        { transaction },
      );
      await transaction.commit();
      // update Routed in background
      routed
        .upsertVenue(record.id)
        .then()
        .catch((err) => rollbar.error(err, { venueId: record.id }));
      return res.json(record.toJSON());
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }),
);

module.exports = router;
