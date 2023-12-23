const express = require('express');

const HttpStatus = require('http-status-codes');
const models = require('../../models');

const helpers = require('../helpers');
const interceptors = require('../interceptors');

const router = express.Router();

router.post(
  '/',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    await models.sequelize.transaction(async (transaction) => {
      let user;
      if (req.body.userId) {
        user = await models.User.findByPk(req.body.userId, { rejectOnEmpty: true, transaction });
      } else {
        user = req.user;
      }
      let vehicle;
      if (req.body.number) {
        [vehicle] = await models.Vehicle.findOrCreate({
          where: {
            createdByAgencyId: req.agency.id,
            number: {
              [models.Sequelize.Op.iLike]: req.body.number,
            },
          },
          defaults: {
            number: req.body.number,
            callSign: req.body.number,
            createdById: req.user.id,
            updatedById: req.user.id,
          },
          transaction,
        });
      } else {
        vehicle = await models.Vehicle.findByPk(req.body.vehicleId, { rejectOnEmpty: true, transaction });
      }
      const assignment = await models.Assignment.assign(req.user, req.agency, user, vehicle, { transaction });
      if (req.apiLevel >= 3) {
        res.status(HttpStatus.CREATED).json({
          Assignment: assignment.toJSON(),
          Vehicle: vehicle?.toJSON(),
        });
      } else {
        res.status(HttpStatus.CREATED).json(assignment.toJSON());
      }
    });
  }),
);

module.exports = router;
