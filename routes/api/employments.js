const express = require('express');
const _ = require('lodash');
const { StatusCodes } = require('http-status-codes');

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
  }),
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
  }),
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
  }),
);

router.post(
  '/',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    await models.sequelize.transaction(async (transaction) => {
      const user = await models.User.findByPk(req.body.userId, { transaction });
      const createdByAgency = await models.Agency.findByPk(req.body.createdByAgencyId, {
        include: [{ model: models.Agency, as: 'claimedAgency' }],
        transaction,
      });
      const employment = await models.Employment.build(_.pick(req.body, ['roles']));
      employment.userId = user?.id;
      employment.firstName = user?.firstName;
      employment.lastName = user?.lastName;
      employment.email = user?.email;
      employment.createdByAgencyId = createdByAgency?.isClaimed ? createdByAgency.id : createdByAgency?.claimedAgency?.id;
      employment.approvedById = req.user.id;
      employment.approvedAt = new Date();
      employment.createdById = req.user.id;
      employment.updatedById = req.user.id;
      await employment.save({ transaction });
      res.json(employment.toJSON());
    });
  }),
);

router.get(
  '/:id',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    const employment = await models.Employment.scope('finalOrNew').findByPk(req.params.id);
    res.json(employment.toJSON());
  }),
);

router.patch(
  '/:id',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    let employment;
    await models.sequelize.transaction(async (transaction) => {
      employment = await models.Employment.scope('finalOrNew').findByPk(req.params.id, { transaction });
      if (employment) {
        const data = _.pick(req.body, ['roles']);
        await employment.update(data, { transaction });
      }
    });
    if (employment) {
      res.json(employment.toJSON());
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  }),
);

router.delete(
  '/:id',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    let employment;
    await models.sequelize.transaction(async (transaction) => {
      employment = await models.Employment.scope('finalOrNew').findByPk(req.params.id, { transaction });
      if (employment) {
        await employment.destroy({ transaction });
      }
    });
    if (employment) {
      res.status(StatusCodes.OK).end();
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  }),
);

module.exports = router;
