const express = require('express');
const _ = require('lodash');

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
    const payload = {};
    payload.City = _.uniqBy(docs.map((i) => i.scene.city).filter(Boolean), (c) => c.id).map((c) => c.toJSON());
    payload.Dispatch = docs
      .flatMap((i) => i.dispatches)
      .filter(Boolean)
      .map((d) => d.toJSON());
    payload.Incident = docs.map((i) => i.toJSON());
    payload.Scene = _.uniqBy(
      docs.map((i) => i.scene.toJSON()),
      (s) => s.id
    );
    payload.State = _.uniqBy(docs.map((i) => i.scene.state).filter(Boolean), (s) => s.id).map((s) => s.toJSON());
    res.json(payload);
  })
);

router.get(
  '/:id',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    // TODO: verify calling user can access this incident
    let payload;
    await models.sequelize.transaction(async (transaction) => {
      const incident = await models.Incident.findByPk(req.params.id, {
        include: [
          {
            model: models.Scene,
            as: 'scene',
            include: ['city', 'state'],
          },
          {
            model: models.Report,
            as: 'reports',
            include: ['patient', 'disposition'],
          },
        ],
        rejectOnEmpty: true,
        transaction,
      });
      payload = await models.Report.createPayload(incident.reports, { transaction });
      payload.City = incident.scene.city.toJSON();
      payload.Incident = incident.toJSON();
      payload.Scene.push(incident.scene.toJSON());
      payload.Scene = _.uniqBy(payload.Scene, (s) => s.id);
      payload.State = incident.scene.state.toJSON();
    });
    res.json(payload);
  })
);

module.exports = router;
