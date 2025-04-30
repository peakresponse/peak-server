const express = require('express');
const { StatusCodes } = require('http-status-codes');
const _ = require('lodash');

const helpers = require('../helpers');
const interceptors = require('../interceptors');
const models = require('../../models');

const { Op } = models.Sequelize;

const router = express.Router();

router.get(
  '/',
  interceptors.requireLogin,
  helpers.async(async (req, res) => {
    const page = req.query.page || 1;
    const options = {
      page,
      where: {},
      order: [['name', 'ASC']],
    };
    if (req.query.search && req.query.search !== '') {
      options.where.name = { [Op.iLike]: `%${req.query.search.trim()}%` };
    }
    if (req.query.type && req.query.type !== '') {
      options.where.type = req.query.type.trim();
    }
    if (req.query.stateId && req.query.stateId !== '') {
      options.where.stateId = req.query.stateId.trim();
    }
    let docs;
    let pages;
    let total;
    if (req.query.lat && req.query.lng) {
      ({ docs, pages, total } = await models.Facility.scope('canonical').findNear(req.query.lat, req.query.lng, options));
    } else {
      ({ docs, pages, total } = await models.Facility.scope('canonical').paginate(options));
    }
    helpers.setPaginationHeaders(req, res, page, pages, total);
    res.json(docs.map((d) => d.toJSON()));
  }),
);

router.post(
  '/',
  interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
  helpers.async(async (req, res) => {
    if (!req.body.venueId && !req.user.isAdmin) {
      res.status(StatusCodes.FORBIDDEN).end();
      return;
    }
    let venue;
    if (req.body.venueId) {
      venue = await models.Venue.findByPk(req.body.venueId);
      if (!venue || venue.archivedAt) {
        res.status(StatusCodes.NOT_FOUND).end();
        return;
      }
      if (venue.createdByAgencyId !== req.agency?.id) {
        res.status(StatusCodes.FORBIDDEN).end();
        return;
      }
    }
    const record = await models.Facility.create({
      ..._.pick(req.body, [
        'venueId',
        'type',
        'name',
        'locationCode',
        'primaryDesignation',
        'primaryNationalProviderId',
        'unit',
        'address',
        'cityId',
        'countyId',
        'stateId',
        'zip',
        'country',
        'primaryPhone',
      ]),
      updatedById: req.user.id,
      createdById: req.user.id,
      createdByAgencyId: req.agency?.id,
    });
    res.status(StatusCodes.CREATED).json(record.toJSON());
  }),
);

router.post(
  '/fetch',
  interceptors.requireLogin,
  helpers.async(async (req, res) => {
    const states = req.body;
    let results = [];
    for (const stateId of Object.keys(states)) {
      const locationCode = states[stateId];
      // eslint-disable-next-line no-await-in-loop
      const facilities = await models.Facility.findAll({
        where: {
          stateId,
          locationCode,
        },
      });
      results = results.concat(facilities.map((f) => f.toJSON()));
    }
    res.json(results);
  }),
);

router.get(
  '/:id',
  interceptors.requireLogin,
  helpers.async(async (req, res) => {
    const record = await models.Facility.findByPk(req.params.id);
    if (record) {
      res.json(record.toJSON());
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  }),
);

router.patch(
  '/:id',
  interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
  helpers.async(async (req, res) => {
    let record;
    await models.sequelize.transaction(async (transaction) => {
      const options = {
        transaction,
      };
      if (!req.user.isAdmin) {
        options.where = {
          createdByAgencyId: req.agency?.id,
        };
      }
      record = await models.Facility.findByPk(req.params.id, options);
      if (record) {
        if (!record.venueId && !req.user.isAdmin) {
          res.status(StatusCodes.FORBIDDEN).end();
          return;
        }
        await record.update(
          _.pick(req.body, [
            'type',
            'name',
            'locationCode',
            'primaryDesignation',
            'primaryNationalProviderId',
            'unit',
            'address',
            'cityId',
            'countyId',
            'stateId',
            'zip',
            'country',
            'primaryPhone',
          ]),
          { transaction },
        );
      }
    });
    if (record) {
      res.json(record.toJSON());
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  }),
);

router.post(
  '/:id/geocode',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    const record = await models.Facility.findByPk(req.params.id);
    if (record) {
      await record.geocode();
      await record.save();
      res.json(record.toJSON());
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  }),
);

module.exports = router;
