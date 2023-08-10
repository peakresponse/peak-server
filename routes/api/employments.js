const express = require('express');

const models = require('../../models');
const helpers = require('../helpers');
const interceptors = require('../interceptors');

const router = express.Router();

router.get(
  '/',
  interceptors.requireAgency(models.Employment.Roles.PERSONNEL),
  helpers.async(async (req, res) => {
    const page = req.query.page || 1;
    const options = {
      where: {
        createdByAgencyId: req.agency.id,
      },
      include: [{ model: models.User, as: 'user' }],
      page,
      order: [
        ['last_name', 'ASC'],
        ['first_name', 'ASC'],
        ['email', 'ASC'],
      ],
    };
    if (req.query.isPending !== undefined) {
      options.where.isPending = !!parseInt(req.query.isPending, 10);
      options.where.refusedAt = null;
    }
    const { docs, pages, total } = await models.Employment.scope('finalOrNew').paginate(options);
    helpers.setPaginationHeaders(req, res, page, pages, total);
    res.json(await Promise.all(docs.map((d) => d.toFullJSON())));
  })
);

router.post(
  '/:id/approve',
  interceptors.requireAgency(models.Employment.Roles.PERSONNEL),
  helpers.async(async (req, res) => {
    await models.sequelize.transaction(async (transaction) => {
      const employment = await models.Employment.scope('finalOrNew').findByPk(req.params.id, { transaction });
      await employment.approve(req.user, { transaction });
      res.json(employment.toJSON());
    });
  })
);

router.post(
  '/:id/refuse',
  interceptors.requireAgency(models.Employment.Roles.PERSONNEL),
  helpers.async(async (req, res) => {
    await models.sequelize.transaction(async (transaction) => {
      const employment = await models.Employment.scope('finalOrNew').findByPk(req.params.id, { transaction });
      await employment.refuse(req.user, { transaction });
      res.json(employment.toJSON());
    });
  })
);

module.exports = router;
