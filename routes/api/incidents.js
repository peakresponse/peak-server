const express = require('express');

// const HttpStatus = require('http-status-codes');
const models = require('../../models');

const helpers = require('../helpers');
const interceptors = require('../interceptors');

const router = express.Router();

router.get(
  '/',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    const page = req.query.page || 1;
    const options = {
      page,
    };
    if (req.query.search && req.query.search !== '') {
      const search = req.query.search.trim();
      if (search) {
        options.search = search;
      }
    }
    // manually paginate due to complex joins
    let type;
    let obj;
    if (req.query.vehicleId && req.query.vehicleId !== '') {
      type = 'Vehicle';
      obj = await models.Vehicle.findByPk(req.query.vehicleId, { rejectOnEmpty: true });
    } else {
      type = 'Agency';
      obj = req.agency;
    }
    const { docs, pages, total } = await models.Incident.paginate(type, obj, options);
    helpers.setPaginationHeaders(req, res, page, pages, total);
    res.json(docs.map((r) => r.toJSON()));
  })
);

module.exports = router;
