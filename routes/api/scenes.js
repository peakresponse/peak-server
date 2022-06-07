const express = require('express');
const HttpStatus = require('http-status-codes');

const helpers = require('../helpers');
const interceptors = require('../interceptors');
const models = require('../../models');
const { dispatchSceneUpdate } = require('../../wss');

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
    let scene;
    let created;
    await models.sequelize.transaction(async (transaction) => {
      if (req.body.Scene) {
        [scene, created] = await models.Scene.createOrUpdate(req.user, req.agency, req.body.Scene, { transaction });
      }
      for (const model of ['Responder', 'ScenePin']) {
        let records = req.body[model];
        if (records) {
          if (!Array.isArray(records)) {
            records = [records];
          }
          for (const record of records) {
            // eslint-disable-next-line no-await-in-loop
            const [obj] = await models[model].createOrUpdate(req.user, req.agency, record, {
              transaction,
            });
            if (!scene) {
              // eslint-disable-next-line no-await-in-loop
              scene = await obj.getScene({ transaction });
              // eslint-disable-next-line no-await-in-loop
              scene = await scene.getCurrent({ transaction });
            }
          }
        }
      }
      await models.Scene.update(
        { respondersCount: await models.Responder.scope('onscene').count({ where: { sceneId: scene.canonicalId }, transaction }) },
        { where: { id: scene.canonicalId }, transaction }
      );
    });
    res.status(created ? HttpStatus.CREATED : HttpStatus.OK).json(scene.toJSON());
    await dispatchSceneUpdate(scene.canonicalId);
  })
);

module.exports = router;
