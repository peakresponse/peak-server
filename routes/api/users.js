const express = require('express');
const HttpStatus = require('http-status-codes');
const { Op } = require('sequelize');
const _ = require('lodash');

const aws = require('../../lib/aws');
const models = require('../../models');
const helpers = require('../helpers');
const interceptors = require('../interceptors');

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
  })
);

router.post(
  '/',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    const user = await models.User.register(req.body);
    res.status(HttpStatus.CREATED).json(user.toJSON());
  })
);

router.get(
  '/me',
  interceptors.requireLogin,
  helpers.async(async (req, res) => {
    if (req.apiLevel > 1) {
      const data = {
        User: req.user.toJSON(),
      };
      // add additional privilege info
      data.User.isAdmin = req.user.isAdmin;
      // temporary AWS credentials for use with Transcribe service
      data.User.awsCredentials = await aws.getTemporaryCredentialsForMobileApp();
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
          await models.Employment.findOne({
            where: { userId: req.user.id, agencyId: req.agency.id },
          })
        )?.toJSON();
      }
      res.json(data);
    } else {
      const data = {
        user: req.user.toJSON(),
      };
      // add additional privilege info
      data.user.isAdmin = req.user.isAdmin;
      // add any active scenes the user may be a part of
      data.user.activeScenes = (await req.user.getActiveScenes()).map((s) => s.toJSON());
      // add vehicle/unit assignment, if any
      data.user.currentAssignment =
        (
          await req.user.getCurrentAssignment({
            include: [
              {
                model: models.Vehicle,
                as: 'vehicle',
                include: 'createdByAgency',
              },
            ],
          })
        )?.toJSON() ?? null;
      // temporary AWS credentials for use with Transcribe service
      data.user.awsCredentials = await aws.getTemporaryCredentialsForMobileApp();
      // add Agency/Employment info, if any
      if (req.agency) {
        data.agency = req.agency.toJSON();
        data.employment = (
          await models.Employment.findOne({
            where: { userId: req.user.id, agencyId: req.agency.id },
          })
        ).toJSON();
      }
      res.json(data);
    }
  })
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
      res.status(HttpStatus.NOT_FOUND).end();
    }
  })
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
      res.status(HttpStatus.NOT_FOUND).end();
    }
  })
);

module.exports = router;
