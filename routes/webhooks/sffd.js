const express = require('express');
const HttpStatus = require('http-status-codes');
const uuid = require('uuid');

const models = require('../../models');

const router = express.Router();

const UNIT_SFFD_REGEX = /^\d+$/;
const UNIT_AM_REGEX = /^AM\d+$/;
const UNIT_KM_REGEX = /^KM\d+$/;

router.post('/cad', async (req, res) => {
  const data = req.body;
  if (!Array.isArray(data)) {
    res.status(HttpStatus.UNPROCESSABLE_ENTITY).end();
    return;
  }
  if (!req.user) {
    res.status(HttpStatus.UNAUTHORIZED).end();
    return;
  }
  const psap = await models.Psap.findByPk('588', { rejectOnEmpty: true });
  const dispatcher = await models.Dispatcher.findOne({
    where: {
      psapId: psap.id,
      userId: req.user.id,
    },
  });
  if (!dispatcher) {
    res.status(HttpStatus.FORBIDDEN).end();
    return;
  }
  await models.sequelize.transaction(async (transaction) => {
    const sffd = await models.Agency.scope('claimed').findOne({
      where: {
        stateUniqueId: 'S38-50827',
      },
      transaction,
    });
    const vehicles = {};
    const incidents = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const record of data) {
      const { UNIT, INC_NO, ADDRESS, DISPATCH_DTTM } = record;
      // skip records with no incident number
      if (!INC_NO) {
        // eslint-disable-next-line no-continue
        continue;
      }
      let org = null;
      if (UNIT_SFFD_REGEX.test(UNIT)) {
        org = sffd;
      } else if (UNIT_AM_REGEX.test(UNIT)) {
        // noop
      } else if (UNIT_KM_REGEX.test(UNIT)) {
        // noop
      }
      if (!vehicles[UNIT]) {
        if (org) {
          // eslint-disable-next-line no-await-in-loop
          const [vehicle] = await models.Vehicle.findOrCreate({
            where: {
              createdByAgencyId: org.id,
              number: UNIT,
            },
            defaults: {
              createdById: req.user.id,
              updatedById: req.user.id,
            },
            transaction,
          });
          vehicles[UNIT] = vehicle;
        }
      }
      if (!incidents[INC_NO]) {
        // eslint-disable-next-line no-await-in-loop
        const [incident] = await models.Incident.findOrBuild({
          where: {
            number: INC_NO,
          },
          defaults: {
            psapId: psap.id,
            createdById: req.user.id,
            updatedById: req.user.id,
          },
          transaction,
        });
        if (incident.isNewRecord) {
          const newScene = {
            id: uuid.v4(),
            canonicalId: uuid.v4(),
            address1: ADDRESS.trim(),
          };
          if (newScene.address1.endsWith(', SF')) {
            newScene.address1 = newScene.address1.substring(0, newScene.address1.length - 4);
            newScene.cityId = '2411786';
            newScene.countyId = '06075';
            newScene.stateId = '06';
          }
          // eslint-disable-next-line no-await-in-loop
          const [scene,] = await models.Scene.createOrUpdate(req.user, null, newScene, { transaction });
          incident.sceneId = scene.id;
          // eslint-disable-next-line no-await-in-loop
          await incident.save({ transaction });
        }
        incidents[INC_NO] = incident;
      }
      if (vehicles[UNIT] && incidents[INC_NO]) {
        // eslint-disable-next-line no-await-in-loop
        const dispatch = await models.Dispatch.scope('canonical').findOne({
          where: {
            incidentId: incidents[INC_NO].id,
            vehicleId: vehicles[UNIT].id,
          },
          transaction,
        });
        if (!dispatch) {
          // eslint-disable-next-line no-await-in-loop
          await models.Dispatch.createOrUpdate(
            req.user,
            null,
            {
              id: uuid.v4(),
              canonicalId: uuid.v4(),
              incidentId: incidents[INC_NO].id,
              vehicleId: vehicles[UNIT].id,
              dispatchedAt: DISPATCH_DTTM,
            },
            { transaction }
          );
        }
      }
    }
  });
  res.status(HttpStatus.OK).end();
});

module.exports = router;
