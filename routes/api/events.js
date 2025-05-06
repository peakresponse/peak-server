const express = require('express');
const { StatusCodes } = require('http-status-codes');
const _ = require('lodash');
const { Op } = require('sequelize');

const models = require('../../models');

const helpers = require('../helpers');
const interceptors = require('../interceptors');

const router = express.Router();

router.get(
  '/',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    const { filter = 'current', page = '1', search } = req.query;
    const options = {
      page,
      include: [
        {
          model: models.Venue,
          as: 'venue',
          include: ['city', 'state', 'county'],
        },
      ],
      where: {
        createdByAgencyId: req.agency.id,
        archivedAt: null,
      },
      order: [
        ['startTime', 'ASC'],
        ['endTime', 'ASC'],
        ['name', 'ASC'],
      ],
    };
    if (filter === 'past') {
      options.where.endTime = {
        [Op.lt]: new Date(),
      };
    } else {
      options.where.endTime = {
        [Op.gte]: new Date(),
      };
    }
    if (search) {
      options.where.name = {
        [Op.iLike]: `%${search.trim()}%`,
      };
    }
    const { docs, pages, total } = await models.Event.paginate(options);
    helpers.setPaginationHeaders(req, res, page, pages, total);
    const payload = {};
    payload.City = _.uniqBy(docs.map((i) => i.venue?.city).filter(Boolean), (c) => c.id).map((c) => c.toJSON());
    payload.State = _.uniqBy(docs.map((i) => i.venue?.state).filter(Boolean), (s) => s.id).map((s) => s.toJSON());
    payload.County = _.uniqBy(docs.map((i) => i.venue?.county).filter(Boolean), (c) => c.id).map((c) => c.toJSON());
    payload.Venue = _.uniqBy(docs.map((i) => i.venue).filter(Boolean), (v) => v.id).map((v) => {
      delete v.city;
      delete v.state;
      delete v.county;
      return v.toJSON();
    });
    payload.Event = docs.map((e) => {
      delete e.venue;
      return e.toJSON();
    });
    res.json(payload);
  }),
);

router.post(
  '/',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    const record = await models.Event.create({
      ..._.pick(req.body, ['name', 'description', 'startTime', 'endTime', 'venueId']),
      createdById: req.user.id,
      createdByAgencyId: req.agency.id,
      updatedById: req.user.id,
    });
    return res.status(StatusCodes.CREATED).json(record.toJSON());
  }),
);

router.get(
  '/:id',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    const record = await models.Event.findOne({
      where: {
        id: req.params.id,
        archivedAt: null,
      },
      include: [{ model: models.Venue, as: 'venue', include: ['city', 'state', 'county', 'facilities'] }],
      order: [['venue', 'facilities', 'name', 'ASC']],
    });
    if (!record) {
      return res.status(StatusCodes.NOT_FOUND).end();
    }
    return res.json(record.createPayload());
  }),
);

router.patch(
  '/:id',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    const record = await models.Event.findOne({
      where: {
        id: req.params.id,
        archivedAt: null,
      },
      include: [{ model: models.Venue, as: 'venue', include: ['city', 'state', 'county', 'facilities'] }],
      order: [['venue', 'facilities', 'name', 'ASC']],
    });
    if (!record) {
      return res.status(StatusCodes.NOT_FOUND).end();
    }
    await record.update({
      ..._.pick(req.body, ['name', 'description', 'startTime', 'endTime', 'venueId']),
      updatedById: req.user.id,
    });
    return res.json(record.createPayload());
  }),
);

router.delete(
  '/:id',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    const record = await models.Event.findByPk(req.params.id);
    if (!record) {
      return res.status(StatusCodes.NOT_FOUND).end();
    }
    await record.update({
      archivedAt: new Date(),
      updatedById: req.user.id,
    });
    return res.json(record.toJSON());
  }),
);

module.exports = router;
