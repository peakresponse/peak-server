const HttpStatus = require('http-status-codes');

const models = require('../../../models');
const helpers = require('../../helpers');
const interceptors = require('../../interceptors');

function addIndex(router, model, options) {
  const { include = [], order = [] } = options?.index ?? {};

  router.get(
    '/',
    interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
    helpers.async(async (req, res) => {
      const page = req.query.page || 1;
      const { docs, pages, total } = await model.scope('finalOrNew').paginate({
        page,
        include: ['draft'].concat(include),
        where: { createdByAgencyId: req.agency.id },
        order,
      });
      helpers.setPaginationHeaders(req, res, page, pages, total);
      let payload;
      if (options?.index?.serializer) {
        payload = await options.index.serializer(docs);
      } else {
        payload = await Promise.all(docs.map((d) => d.toNemsisJSON()));
      }
      res.json(payload);
    })
  );
}

function addCreate(router, model) {
  router.post(
    '/',
    interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
    helpers.async(async (req, res) => {
      const version = await req.agency.getOrCreateDraftVersion(req.user);
      const record = await model.create({
        versionId: version.id,
        isDraft: true,
        createdByAgencyId: req.agency.id,
        data: req.body.data,
        createdById: req.user.id,
        updatedById: req.user.id,
      });
      res.status(HttpStatus.CREATED).json(await record.toNemsisJSON());
    })
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
        res.status(HttpStatus.OK).json(await record.toNemsisJSON());
      } else {
        res.status(HttpStatus.NOT_FOUND).end();
      }
    })
  );
}

function addUpdate(router, model) {
  router.put(
    '/:id',
    interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
    helpers.async(async (req, res) => {
      let record = await model.findOne({
        where: {
          id: req.params.id,
          createdByAgencyId: req.agency.id,
        },
      });
      if (record) {
        const { archivedAt, data } = req.body;
        const version = await req.agency.getOrCreateDraftVersion(req.user);
        record = await record.updateDraft({ versionId: version.id, archivedAt, data, updatedById: req.user.id });
        res.status(HttpStatus.OK).json(await record.toNemsisJSON());
      } else {
        res.status(HttpStatus.NOT_FOUND).end();
      }
    })
  );
}

function addDelete(router, model) {
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
          await record.destroy({ transaction });
        }
      });
      res.status(HttpStatus.NO_CONTENT).end();
    })
  );
}

function addAllRoutes(router, model, options) {
  addIndex(router, model, options);
  addCreate(router, model);
  addGet(router, model);
  addUpdate(router, model);
  addDelete(router, model);
}

module.exports = {
  addAllRoutes,
  addIndex,
  addCreate,
  addGet,
  addUpdate,
  addDelete,
};
