const express = require('express');

const HttpStatus = require('http-status-codes');
const models = require('../../models');

const { Op } = models.Sequelize;

const helpers = require('../helpers');
const interceptors = require('../interceptors');

const router = express.Router();

router.get(
  '/',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    const page = req.query.page || 1;
    const options = {
      page,
      include: [{ model: models.State, as: 'state' }],
      order: [['name', 'ASC']],
    };
    const conditions = [];
    if (req.query.search && req.query.search !== '') {
      conditions.push({ name: { [Op.iLike]: `%${req.query.search.trim()}%` } });
    }
    if (req.query.stateId && req.query.stateId !== '') {
      conditions.push({
        stateId: req.query.stateId,
      });
    }
    if (conditions.length > 0) {
      options.where = {
        [Op.and]: conditions,
      };
    }
    const { docs, pages, total } = await models.Psap.paginate(options);
    helpers.setPaginationHeaders(req, res, page, pages, total);
    res.json(docs.map((r) => r.toJSON()));
  }),
);

router.get(
  '/:id',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    const psap = await models.Psap.findByPk(req.params.id);
    if (psap) {
      res.json(psap.toJSON());
    } else {
      res.send(HttpStatus.NOT_FOUND).end();
    }
  }),
);

module.exports = router;
