const { StatusCodes } = require('http-status-codes');

const models = require('../../../models');
const helpers = require('../../helpers');
const interceptors = require('../../interceptors');

function addIndex(router, model, options) {
  const { include = [], order = [], searchFields = [] } = options?.index ?? {};

  router.get(
    '/',
    interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
    helpers.async(async (req, res) => {
      const { page = '1', search } = req.query;
      const params = {
        page,
        include: ['draft'].concat(include),
        where: {
          createdByAgencyId: req.agency.id,
          archivedAt: null,
        },
        order,
      };
      if (search && searchFields.length > 0) {
        const query = {};
        for (const searchField of searchFields) {
          query[searchField] = {
            [models.Sequelize.Op.iLike]: `%${search}%`,
          };
        }
        params.where[models.Sequelize.Op.or] = query;
      }
      const { docs, pages, total } = await model.scope('finalOrNew').paginate(params);
      helpers.setPaginationHeaders(req, res, page, pages, total);
      let payload;
      if (options?.index?.serializer) {
        payload = await options.index.serializer(docs);
      } else {
        payload = await Promise.all(docs.map((d) => d.toNemsisJSON()));
      }
      res.json(payload);
    }),
  );
}

function addCreate(router, model, options) {
  const { afterCreate } = options?.create ?? {};
  router.post(
    '/',
    interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
    helpers.async(async (req, res) => {
      let record;
      await models.sequelize.transaction(async (transaction) => {
        const version = await req.agency.getOrCreateDraftVersion(req.user, { transaction });
        record = await model.create(
          {
            versionId: version.id,
            isDraft: true,
            createdByAgencyId: req.agency.id,
            data: req.body.data,
            createdById: req.user.id,
            updatedById: req.user.id,
          },
          { transaction },
        );
        if (afterCreate) {
          await Promise.resolve(afterCreate(version, record, { transaction }));
        }
      });
      res.status(StatusCodes.CREATED).json(await record?.toNemsisJSON());
    }),
  );
}

function addGet(router, model) {
  router.get(
    '/:id',
    interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
    helpers.async(async (req, res) => {
      const record = await model.findOne({
        where: {
          id: req.params.id,
          createdByAgencyId: req.agency.id,
        },
      });
      if (record) {
        res.status(StatusCodes.OK).json(await record.toNemsisJSON());
      } else {
        res.status(StatusCodes.NOT_FOUND).end();
      }
    }),
  );
}

function addUpdate(router, model, options) {
  const { afterSave } = options?.update ?? {};
  router.put(
    '/:id',
    interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
    helpers.async(async (req, res) => {
      let record;
      await models.sequelize.transaction(async (transaction) => {
        record = await model.findOne({
          where: {
            id: req.params.id,
            createdByAgencyId: req.agency.id,
          },
          transaction,
        });
        if (record) {
          const { archivedAt, data } = req.body;
          const version = await req.agency.getOrCreateDraftVersion(req.user, { transaction });
          record = await record.updateDraft({ versionId: version.id, archivedAt, data, updatedById: req.user.id }, { transaction });
          if (afterSave) {
            await Promise.resolve(afterSave(version, record, { transaction }));
          }
        }
      });
      if (record) {
        res.status(StatusCodes.OK).json(await record.toNemsisJSON());
      } else {
        res.status(StatusCodes.NOT_FOUND).end();
      }
    }),
  );
}

function addDelete(router, model, options) {
  const { afterDestroy } = options?.delete ?? {};
  router.delete(
    '/:id',
    interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
    helpers.async(async (req, res) => {
      await models.sequelize.transaction(async (transaction) => {
        let record = await model.findOne({
          where: {
            id: req.params.id,
            createdByAgencyId: req.agency.id,
          },
          transaction,
        });
        if (!record.isDraft) {
          record = await record.getDraft({ transaction });
        }
        if (record) {
          const version = await record.getVersion({ transaction });
          await record.destroy({ transaction });
          if (afterDestroy) {
            await Promise.resolve(afterDestroy(version, record, { transaction }));
          }
        }
      });
      res.status(StatusCodes.NO_CONTENT).end();
    }),
  );
}

function addAllRoutes(router, model, options) {
  addIndex(router, model, options);
  addCreate(router, model, options);
  addGet(router, model);
  addUpdate(router, model, options);
  addDelete(router, model, options);
}

module.exports = {
  addAllRoutes,
  addIndex,
  addCreate,
  addGet,
  addUpdate,
  addDelete,
};
