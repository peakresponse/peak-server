const express = require('express');
const { StatusCodes } = require('http-status-codes');
const _ = require('lodash');

const models = require('../../models');

const helpers = require('../helpers');
const interceptors = require('../interceptors');

const router = express.Router();

router.get(
  '/',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    const versions = await models.Version.findAll({
      where: {
        agencyId: req.agency.id,
      },
      order: [['createdAt', 'DESC']],
    });
    res.json(versions.map((v) => v.toJSON()));
  }),
);

router.post(
  '/',
  interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
  helpers.async(async (req, res) => {
    const version = await req.agency.getOrCreateDraftVersion(req.user);
    res.json(version.toJSON());
  }),
);

router.get(
  '/:id/import',
  interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
  helpers.async(async (req, res) => {
    const version = await models.Version.findByPk(req.params.id);
    res.status(version.status?.code ?? StatusCodes.INTERNAL_SERVER_ERROR).json(version.status);
  }),
);

router.patch(
  '/:id/import',
  interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
  helpers.async(async (req, res) => {
    let version;
    await models.sequelize.transaction(async (transaction) => {
      version = await models.Version.findByPk(req.params.id, { transaction });
      if (version) {
        if (version.agencyId === req.agency.id) {
          if (version.isDraft) {
            await version.update(_.pick(req.body, ['file', 'fileName']), {
              transaction,
            });
          }
        }
      }
    });
    if (version) {
      if (version.agencyId === req.agency.id) {
        await version.startImportDataSet(req.user);
        res.status(version.status.code ?? StatusCodes.INTERNAL_SERVER_ERROR).end();
      } else {
        res.status(StatusCodes.FORBIDDEN).end();
      }
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  }),
);

router.get(
  '/:id/preview',
  interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
  helpers.async(async (req, res) => {
    const version = await models.Version.findByPk(req.params.id);
    if (version) {
      if (version.agencyId === req.agency.id) {
        if (version.isDraft) {
          await version.regenerate();
        }
        res.set('Content-Type', 'application/xml');
        res.send(version.demDataSet);
      } else {
        res.status(StatusCodes.FORBIDDEN).end();
      }
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  }),
);

router.get(
  '/:id/validate',
  interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
  helpers.async(async (req, res) => {
    const version = await models.Version.findByPk(req.params.id);
    if (version) {
      if (version.agencyId === req.agency.id) {
        if (version.isDraft) {
          await version.regenerate();
          await version.nemsisValidate();
        }
        res.json(version.validationErrors).end();
      } else {
        res.status(StatusCodes.FORBIDDEN).end();
      }
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  }),
);

router.patch(
  '/:id/commit',
  interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
  helpers.async(async (req, res) => {
    let version;
    await models.sequelize.transaction(async (transaction) => {
      version = await models.Version.findByPk(req.params.id, { transaction });
      if (version) {
        if (version.agencyId === req.agency.id) {
          if (version.isDraft) {
            await version.commit({ transaction });
          }
        }
      }
    });
    if (version) {
      if (version.agencyId === req.agency.id) {
        res.status(StatusCodes.OK).end();
      } else {
        res.status(StatusCodes.FORBIDDEN).end();
      }
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  }),
);

router.get(
  '/:id',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    const version = await models.Version.findByPk(req.params.id);
    if (version) {
      if (version.agencyId === req.agency.id) {
        res.json(version.toJSON());
      } else {
        res.status(StatusCodes.FORBIDDEN).end();
      }
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  }),
);

router.patch(
  '/:id',
  interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
  helpers.async(async (req, res) => {
    let version;
    await models.sequelize.transaction(async (transaction) => {
      version = await models.Version.findByPk(req.params.id, { transaction });
      if (version) {
        if (version.agencyId === req.agency.id) {
          if (version.isDraft) {
            await version.update(_.pick(req.body, ['nemsisVersion', 'stateDataSetId', 'demSchematronIds', 'emsSchematronIds']), {
              transaction,
            });
          }
        }
      }
    });
    if (version) {
      if (version.agencyId === req.agency.id) {
        res.status(StatusCodes.OK).end();
      } else {
        res.status(StatusCodes.FORBIDDEN).end();
      }
    } else {
      res.status(StatusCodes.NOT_FOUND);
    }
  }),
);

router.delete(
  '/:id',
  interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
  helpers.async(async (req, res) => {
    let version;
    await models.sequelize.transaction(async (transaction) => {
      version = await models.Version.findByPk(req.params.id, { transaction });
      if (version?.isDraft) {
        await Promise.all(
          [
            models.Agency,
            models.Configuration,
            models.Contact,
            models.CustomConfiguration,
            models.Device,
            models.Employment,
            models.Facility,
            models.Location,
            models.Report,
            models.Vehicle,
          ].map((model) =>
            model.destroy({
              where: { versionId: version.id },
              transaction,
            }),
          ),
        );
        await version.destroy({ transaction });
      }
    });
    if (version?.isDraft) {
      res.status(StatusCodes.OK).end();
    } else if (version) {
      res.status(StatusCodes.NOT_ALLOWED).end();
    } else {
      res.status(StatusCodes.NOT_FOUND);
    }
  }),
);

module.exports = router;
