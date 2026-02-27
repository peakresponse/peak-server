const express = require('express');
const { StatusCodes } = require('http-status-codes');
const { DateTime } = require('luxon');
const { v4: uuid } = require('uuid');

const models = require('../../models');
const rollbar = require('../../lib/rollbar');
const states = require('../../lib/states');
const { dispatchIncidentUpdate } = require('../../wss');

const router = express.Router();

router.post('/cad', async (req, res) => {
  // check for authenticated user
  if (!req.user) {
    res.status(StatusCodes.UNAUTHORIZED).end();
    return;
  }
  // find corresponding dispatcher record for the user
  const psap = await models.Psap.findByPk('3152', { rejectOnEmpty: true });
  const dispatcher = await models.Dispatcher.findOne({
    where: {
      psapId: psap.id,
      userId: req.user.id,
    },
  });
  if (!dispatcher) {
    res.status(StatusCodes.FORBIDDEN).end();
    return;
  }
  try {
    let incident;
    await models.sequelize.transaction(async (transaction) => {
      const hyannis = await models.Agency.scope('claimed').findOne({
        where: {
          stateUniqueId: '3110',
          stateId: '25',
        },
        transaction,
      });
      const filename = req.headers['x-filename'];
      const m = filename.match(/DISPATCH-SENT-(\d{2})-(\d{2})-(\d{4})_(\d{2})-(\d{2})-(\d{2})-(\d{3})/);
      let dispatchedAt;
      if (m) {
        const month = parseInt(m[1], 10);
        const day = parseInt(m[2], 10);
        const year = parseInt(m[3], 10);
        const hour = parseInt(m[4], 10);
        const minute = parseInt(m[5], 10);
        const second = parseInt(m[6], 10);
        const millisecond = parseInt(m[7], 10);
        dispatchedAt = DateTime.utc(year, month, day, hour, minute, second, millisecond);
        dispatchedAt = dispatchedAt.setZone('America/New_York', { keepLocalTime: true });
        dispatchedAt = dispatchedAt.toISO();
      }
      const data = req.body;
      if (dispatchedAt && data.incident_number && data.unit_codes) {
        [incident] = await models.Incident.findOrBuild({
          where: {
            number: data.incident_number,
          },
          defaults: {
            psapId: psap.id,
            data,
            createdById: req.user.id,
            updatedById: req.user.id,
          },
          transaction,
        });
        if (incident.isNewRecord) {
          const newScene = {
            id: uuid(),
            canonicalId: uuid(),
            address1: data.address?.trim(),
            address2: data.address2?.trim(),
            lat: data.latitude,
            lng: data.longitude,
          };
          newScene.stateId = states.abbrMapping[data.state_code]?.code;
          newScene.cityId = await models.City.getCode(data.city, newScene.stateId, { transaction });
          const [scene] = await models.Scene.createOrUpdate(req.user, null, newScene, { transaction });
          incident.sceneId = scene.canonicalId;
          await incident.save({ transaction });
        } else {
          incident.data = data;
          await incident.save({ transaction });
        }

        const units = data.unit_codes.split(',');
        for (const unit of units) {
          // eslint-disable-next-line no-await-in-loop
          const [vehicle] = await models.Vehicle.findOrCreate({
            where: {
              createdByAgencyId: hyannis.id,
              number: unit,
            },
            defaults: {
              createdById: req.user.id,
              updatedById: req.user.id,
            },
            transaction,
          });
          // eslint-disable-next-line no-await-in-loop
          const dispatch = await models.Dispatch.scope('canonical').findOne({
            where: {
              incidentId: incident.id,
              vehicleId: vehicle.id,
            },
            transaction,
          });
          if (!dispatch) {
            // eslint-disable-next-line no-await-in-loop
            await models.Dispatch.createOrUpdate(
              req.user,
              null,
              {
                id: uuid(),
                canonicalId: uuid(),
                incidentId: incident.id,
                vehicleId: vehicle.id,
                dispatchedAt,
              },
              { transaction },
            );
          }
        }
      }
    });
    res.status(StatusCodes.OK).end();
    if (incident) {
      await dispatchIncidentUpdate(incident.id);
    }
  } catch (err) {
    rollbar.error(err, req);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
  }
});

module.exports = router;
