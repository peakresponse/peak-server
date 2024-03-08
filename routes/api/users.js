const express = require('express');
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');
const _ = require('lodash');

const sts = require('../../lib/aws/sts');
const models = require('../../models');
const helpers = require('../helpers');
const interceptors = require('../interceptors');
const rollbar = require('../../lib/rollbar');

const router = express.Router();

router.get(
  '/',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    const { page, search } = req.query;
    const where = {};
    if (search) {
      where[Op.or] = [
        { lastName: { [Op.iLike]: `%${search}%` } },
        { firstName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }
    const { docs, pages, total } = await models.User.paginate({
      page: req.query.page || 1,
      where,
      order: [
        ['last_name', 'ASC'],
        ['first_name', 'ASC'],
        ['email', 'ASC'],
      ],
    });
    helpers.setPaginationHeaders(req, res, page, pages, total);
    res.json(docs.map((d) => d.toJSON()));
  }),
);

router.post(
  '/',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    const user = await models.User.register(req.body);
    res.status(StatusCodes.CREATED).json(user.toJSON());
  }),
);

router.get(
  '/me',
  interceptors.requireLogin,
  helpers.async(async (req, res) => {
    const data = {
      User: req.user.toJSON(),
    };
    // add additional privilege info
    data.User.isAdmin = req.user.isAdmin;
    // temporary AWS credentials for use with Transcribe service
    try {
      data.User.awsCredentials = await sts.getTemporaryCredentialsForMobileApp();
    } catch (error) {
      rollbar.error(error, req);
    }
    // add any active scenes the user may be a part of
    const scenes = await req.user.getActiveScenes({ include: ['city', 'incident', 'state'] });
    data.Scene = scenes.map((s) => s.toJSON());
    data.Incident = scenes.map((s) => s.incident.toJSON());
    data.City = scenes.map((s) => s.city?.toJSON()).filter(Boolean);
    data.State = scenes.map((s) => s.state?.toJSON()).filter(Boolean);
    // add vehicle/unit assignment, if any
    const assignment = await req.user.getCurrentAssignment({
      include: [
        {
          model: models.Vehicle,
          as: 'vehicle',
          include: 'createdByAgency',
        },
      ],
    });
    data.Assignment = assignment?.toJSON() ?? null;
    data.Vehicle = assignment?.vehicle?.toJSON() ?? null;
    data.Agency = [];
    if (assignment?.vehicle?.createdByAgency) {
      data.Agency.push(assignment.vehicle.createdByAgency.toJSON());
    }
    // add Agency/Employment info, if any
    if (req.agency) {
      if (!data.Agency.find((a) => a.id === req.agency.id)) {
        data.Agency.push(req.agency.toJSON());
      }
      data.Employment = (
        await models.Employment.scope('finalOrNew').findOne({
          where: { userId: req.user.id, createdByAgencyId: req.agency.id },
        })
      )?.toJSON();
      // add Region info, if any
      const region = await req.agency.getRegion();
      if (region) {
        const payload = await region.createPayload();
        payload.Agency.forEach((agency) => {
          if (!data.Agency.find((a) => a.id === agency.id)) {
            data.Agency.push(agency);
          }
        });
        data.Region = payload.Region;
        data.RegionAgency = payload.RegionAgency;
      }
    }
    res.json(data);
  }),
);

router.get(
  '/:id',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    const user = await models.User.findByPk(req.params.id);
    if (user) {
      const data = user.toJSON();
      /// add additional attributes
      data.isAdmin = user.isAdmin;
      data.apiKey = user.apiKey;
      res.json(data);
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  }),
);

router.patch(
  '/:id',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    let user;
    await models.sequelize.transaction(async (transaction) => {
      user = await models.User.findByPk(req.params.id, { transaction });
      if (user) {
        const data = _.pick(req.body, ['firstName', 'lastName', 'email', 'iconFile', 'position', 'apiKey', 'password', 'isAdmin']);
        await user.update(data, { transaction });
      }
    });
    if (user) {
      res.json(user.toJSON());
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  }),
);

module.exports = router;
