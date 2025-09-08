const express = require('express');
const _ = require('lodash');

const models = require('../../models');

const { Roles } = models.Employment;

const helpers = require('../helpers');
const interceptors = require('../interceptors');

const router = express.Router();

router.get(
  '/',
  interceptors.requireAgency(Roles.USER),
  helpers.async(async (req, res) => {
    const { page = '1', search, vehicleId, eventId } = req.query;
    const options = {
      page,
    };
    options.search = search?.trim();
    // manually paginate due to complex joins
    let type;
    let obj;
    if (vehicleId) {
      type = 'Vehicle';
      obj = await models.Vehicle.findByPk(vehicleId, { rejectOnEmpty: true });
    } else if (eventId) {
      type = 'Event';
      obj = await models.Event.findByPk(eventId, { rejectOnEmpty: true });
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
      (s) => s.id,
    );
    payload.State = _.uniqBy(docs.map((i) => i.scene.state).filter(Boolean), (s) => s.id).map((s) => s.toJSON());
    res.json(payload);
  }),
);

router.get(
  '/:id',
  interceptors.requireAgency(Roles.USER),
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
  }),
);

module.exports = router;
