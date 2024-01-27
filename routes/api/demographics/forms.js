const express = require('express');
const { StatusCodes } = require('http-status-codes');
const { v4: uuidv4 } = require('uuid');

const models = require('../../../models');
const helpers = require('../../helpers');
const interceptors = require('../../interceptors');

const router = express.Router();

router.get(
  '/',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    const { page = 1, filter, search } = req.query;
    const options = {
      page,
      where: { createdByAgencyId: req.agency.id, canonicalId: null },
      order: [['title', 'ASC']],
    };
    if (filter === 'archived') {
      options.where.archivedAt = {
        [models.Sequelize.Op.ne]: null,
      };
    } else {
      options.where.archivedAt = null;
    }
    if (search) {
      options.where.title = {
        [models.Sequelize.Op.iLike]: `%${search}%`,
      };
    }
    const { docs, pages, total } = await models.Form.paginate(options);
    helpers.setPaginationHeaders(req, res, page, pages, total);
    res.json(docs.map((doc) => doc.toJSON()));
  }),
);

router.post(
  '/',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    const [record, created] = await models.Form.createOrUpdate(req.user, req.agency, req.body);
    res.status(created ? StatusCodes.CREATED : StatusCodes.OK).json(record.toJSON());
  }),
);

router.get(
  '/:id',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    const record = await models.Form.findOne({
      where: {
        id: req.params.id,
        createdByAgencyId: req.agency.id,
      },
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
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    let record;
    await models.sequelize.transaction(async (transaction) => {
      record = await models.Form.findOne({
        where: {
          id: req.params.id,
          createdByAgencyId: req.agency.id,
          canonicalId: null,
        },
        transaction,
      });
      if (record && !record.archivedAt) {
        await models.Form.createOrUpdate(
          req.user,
          req.agency,
          {
            id: uuidv4(),
            parentId: record.currentId,
            archivedAt: new Date(),
          },
          { transaction },
        );
      }
    });
    if (record) {
      res.status(StatusCodes.OK).end();
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  }),
);

module.exports = router;
