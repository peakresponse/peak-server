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
      const vehicle = await models.Vehicle.findByPk(req.body.vehicleId, { rejectOnEmpty: true, transaction });
      const assignment = await models.Assignment.assign(req.user, req.agency, user, vehicle, { transaction });
      res.status(HttpStatus.CREATED).json(assignment.toJSON());
    });
  })
);

module.exports = router;
