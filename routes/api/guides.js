const express = require('express');
const { StatusCodes } = require('http-status-codes');
const _ = require('lodash');

const models = require('../../models');

const helpers = require('../helpers');
const interceptors = require('../interceptors');

const router = express.Router();

router.get(
  '/',
  helpers.async(async (req, res) => {
    const options = {
      where: { isVisible: true },
      order: [
        ['position', 'ASC'],
        ['name', 'ASC'],
      ],
    };
    if (req.user?.isAdmin) {
      if (req.query.showAll === 'true') {
        delete options.where;
      }
    }
    const records = await models.Guide.findAll(options);
    res.json(records.map((r) => r.toJSON()));
  }),
);

const UUID_REGEX = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;

router.get(
  '/:id',
  helpers.async(async (req, res) => {
    const options = {
      include: {
        model: models.GuideSection,
        as: 'sections',
        where: {
          isVisible: true,
        },
        required: false,
        include: {
          model: models.GuideItem,
          as: 'items',
          where: {
            isVisible: true,
          },
          required: false,
        },
      },
    };
    const { id } = req.params;
    let record;
    if (id.match(UUID_REGEX)) {
      record = await models.Guide.findByPk(req.params.id, options);
    } else {
      options.where = {
        slug: id,
      };
      record = await models.Guide.findOne(options);
    }
    if (record) {
      if (!record.isVisible && !req.user?.isAdmin) {
        res.status(StatusCodes.FORBIDDEN).end();
      } else {
        res.json(record.toJSON());
      }
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  }),
);

router.post(
  '/',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    const record = models.Guide.build(_.pick(req.body, ['name', 'navName', 'slug', 'body', 'position', 'isVisible']));
    record.createdById = req.user.id;
    record.updatedById = req.user.id;
    await record.save();
    res.status(StatusCodes.CREATED).json(record.toJSON());
  }),
);

router.patch(
  '/:id',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    let record;
    await models.sequelize.transaction(async (transaction) => {
      record = await models.Guide.findByPk(req.params.id, { transaction });
      if (record) {
        record.set(_.pick(req.body, ['name', 'navName', 'slug', 'body', 'position', 'isVisible']));
        record.updatedById = req.user.id;
        await record.save({ transaction });
      }
    });
    if (record) {
      res.json(record.toJSON());
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  }),
);

router.delete(
  '/:id',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    let record;
    await models.sequelize.transaction(async (transaction) => {
      record = await models.Guide.findByPk(req.params.id, { transaction });
      if (record) {
        await record.destroy({ transaction });
      }
    });
    if (record) {
      res.json(record.toJSON());
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  }),
);

module.exports = router;
