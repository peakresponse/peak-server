const express = require('express');
const HttpStatus = require('http-status-codes');

const helpers = require('../helpers');
const interceptors = require('../interceptors');
const models = require('../../models');
const { dispatchSceneRespondersUpdate } = require('../../wss');

const router = express.Router();

router.get(
  '/',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    const { sceneId } = req.query;
    if (!sceneId) {
      res.status(HttpStatus.UNPROCESSABLE_ENTITY).end();
      return;
    }
    const records = await models.Responder.scope('latest').findAll({
      where: { sceneId },
      include: [
        { model: models.User, as: 'user' },
        { model: models.Agency, as: 'agency' },
      ],
    });
    const data = await Promise.all(records.map((r) => r.toFullJSON()));
    res.json(data);
  })
);

router.patch(
  '/:id/assign',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    if (!('role' in req.body)) {
      res.status(HttpStatus.UNPROCESSABLE_ENTITY).end();
      return;
    }
    const { role } = req.body;
    let ids;
    await models.sequelize.transaction(async (transaction) => {
      const responder = await models.Responder.findByPk(req.params.id, {
        rejectOnEmpty: true,
        transaction,
      });
      const scene = await models.Scene.findByPk(responder.sceneId, {
        rejectOnEmpty: true,
        transaction,
      });
      /// only IC/MGS can update roles
      if (req.user.id !== scene.incidentCommanderId) {
        res.status(HttpStatus.FORBIDDEN).end();
        return;
      }
      /// cannot assign a role to the MGS (command should be transferred first)
      if (responder.userId === scene.incidentCommanderId) {
        res.status(HttpStatus.FORBIDDEN).end();
        return;
      }
      /// assign the role
      ids = await responder.assign(req.user, req.agency, role, { transaction });
      res.status(HttpStatus.NO_CONTENT).end();
    });
    /// notify all listeners on scene
    if (ids) {
      dispatchSceneRespondersUpdate(ids);
    }
  })
);

module.exports = router;
