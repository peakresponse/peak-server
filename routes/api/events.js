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
      include: ['venue'],
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
        [Op.lte]: new Date(),
      };
    } else {
      options.where.startTime = {
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
    res.json(docs.map((d) => d.toJSON()));
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
    return res.json(record.toJSON());
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
    });
    if (!record) {
      return res.status(StatusCodes.NOT_FOUND).end();
    }
    await record.update({
      ..._.pick(req.body, ['name', 'description', 'startTime', 'endTime', 'venueId']),
      updatedById: req.user.id,
    });
    return res.json(record.toJSON());
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
