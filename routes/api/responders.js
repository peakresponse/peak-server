const express = require('express');
const HttpStatus = require('http-status-codes');

const helpers = require('../helpers');
const interceptors = require('../interceptors');
const models = require('../../models');

const router = express.Router();

router.get(
  '/',
  interceptors.requireLogin(),
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

module.exports = router;
