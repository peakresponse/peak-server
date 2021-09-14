const express = require('express');
const HttpStatus = require('http-status-codes');

const helpers = require('../helpers');
const interceptors = require('../interceptors');
const models = require('../../models');
const { dispatchSceneUpdate, dispatchSceneRespondersUpdate } = require('../../wss');

const { Op } = models.Sequelize;
const router = express.Router();

router.get(
  '/',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    const page = req.query.page || 1;
    const options = {
      page,
      order: [['closedAt', 'DESC']],
    };
    if (req.query.search && req.query.search !== '') {
      options.where = options.where || {};
      options.where.name = { [Op.iLike]: `%${req.query.search.trim()}%` };
    }
    const { docs, pages, total } = await models.Scene.scope({ method: ['agency', req.agency.id] }, 'canonical', 'closed').paginate(options);
    helpers.setPaginationHeaders(req, res, page, pages, total);
    res.json(docs.map((d) => d.toJSON()));
  })
);

router.post(
  '/',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    const [scene] = await models.Scene.start(req.user, req.agency, req.body);
    res.status(HttpStatus.CREATED).json(scene.toJSON());
    await dispatchSceneUpdate(scene.canonicalId);
  })
);

router.patch(
  '/',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    const [scene] = await models.Scene.createOrUpdate(req.user, req.agency, req.body);
    res.status(HttpStatus.OK).json(scene.toJSON());
    await dispatchSceneUpdate(scene.canonicalId);
  })
);

router.get(
  '/:id',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    const scene = await models.Scene.scope('canonical').findByPk(req.params.id);
    res.status(HttpStatus.OK).json(scene.toJSON());
  })
);

router.patch(
  '/:id/close',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    let scene;
    await models.sequelize.transaction(async (transaction) => {
      scene = await models.Scene.findByPk(req.params.id, {
        rejectOnEmpty: true,
        transaction,
      });
      await scene.close(req.user, req.agency, { transaction });
      res.status(HttpStatus.OK).json(scene.toJSON());
    });
    await dispatchSceneUpdate(scene.id);
  })
);

router.patch(
  '/:id/join',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    let responder;
    await models.sequelize.transaction(async (transaction) => {
      const scene = await models.Scene.findByPk(req.params.id, {
        rejectOnEmpty: true,
        transaction,
      });
      responder = await scene.join(req.user, req.agency, { transaction });
      res.status(HttpStatus.OK).json(responder.toJSON());
    });
    await dispatchSceneRespondersUpdate([responder.id]);
  })
);

router.patch(
  '/:id/leave',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    let responder;
    await models.sequelize.transaction(async (transaction) => {
      const scene = await models.Scene.findByPk(req.params.id, {
        rejectOnEmpty: true,
        transaction,
      });
      responder = await scene.leave(req.user, req.agency, { transaction });
      res.status(HttpStatus.OK).json(responder.toJSON());
    });
    await dispatchSceneRespondersUpdate([responder.id]);
  })
);

router.patch(
  '/:id/transfer',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    let scene;
    await models.sequelize.transaction(async (transaction) => {
      scene = await models.Scene.findByPk(req.params.id, {
        rejectOnEmpty: true,
        transaction,
      });
      const user = await models.User.findByPk(req.body.userId, {
        rejectOnEmpty: true,
        transaction,
      });
      const agency = await models.Agency.findByPk(req.body.agencyId, {
        rejectOnEmpty: true,
        transaction,
      });
      await scene.transferCommandTo(user, agency, { transaction });
      res.status(HttpStatus.OK).end();
    });
    await dispatchSceneUpdate(scene.id);
  })
);

router.delete(
  '/:id/pins/:pinId',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    let scene;
    await models.sequelize.transaction(async (transaction) => {
      scene = await models.Scene.findByPk(req.params.id, {
        rejectOnEmpty: true,
        transaction,
      });
      /// only allow incident commander to add/update pins
      if (req.user.id !== scene.incidentCommanderId) {
        res.status(HttpStatus.FORBIDDEN).end();
        return;
      }
      const pin = await models.ScenePin.findOne({
        where: {
          id: req.params.pinId,
          sceneId: scene.id,
        },
        rejectOnEmpty: true,
        transaction,
      });
      await pin.update(
        {
          deletedAt: new Date(),
          deletedById: req.user.id,
          deletedByAgencyId: req.agency.id,
        },
        { transaction }
      );
      res.status(HttpStatus.NO_CONTENT).end();
    });
    await dispatchSceneUpdate(scene.id);
  })
);

router.post(
  '/:id/pins',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    let scene;
    await models.sequelize.transaction(async (transaction) => {
      scene = await models.Scene.findByPk(req.params.id, {
        rejectOnEmpty: true,
        transaction,
      });
      /// only allow incident commander to add/update pins
      if (req.user.id !== scene.incidentCommanderId) {
        res.status(HttpStatus.FORBIDDEN).end();
        return;
      }
      const pin = await models.ScenePin.createOrUpdate(req.user, req.agency, scene, req.body, { transaction });
      res.status(HttpStatus.OK).json(pin.toJSON());
    });
    await dispatchSceneUpdate(scene.id);
  })
);

module.exports = router;
