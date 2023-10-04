const express = require('express');

const models = require('../../models');

const helpers = require('../helpers');
const interceptors = require('../interceptors');

const router = express.Router();

router.get(
  '/',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    const records = await models.Vehicle.findAll({
      where: { createdByAgencyId: req.agency.id },
      order: [
        ['type', 'ASC'],
        ['number', 'ASC'],
        ['vin', 'ASC'],
        ['call_sign', 'ASC'],
      ],
    });
    res.json(records.map((r) => r.toJSON()));
  })
);

module.exports = router;
