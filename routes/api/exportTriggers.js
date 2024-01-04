const express = require('express');
const HttpStatus = require('http-status-codes');
const _ = require('lodash');

const models = require('../../models');

const helpers = require('../helpers');
const interceptors = require('../interceptors');

const router = express.Router();

router.get(
  '/',
  interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
  helpers.async(async (req, res) => {
    const { exportId } = req.query ?? {};
    const options = {};
    if (req.user.isAdmin && exportId) {
      options.where = {
        exportId,
      };
      options.include = ['agency'];
      options.order = [['agency', 'name', 'ASC']];
    } else if (req.agency) {
      options.where = {
        agencyId: req.agency.id,
      };
      options.include = ['export'];
      options.order = [['export', 'name', 'ASC']];
    } else {
      res.status(HttpStatus.BAD_REQUEST).end();
      return;
    }
    const records = await models.ExportTrigger.findAll(options);
    res.json(records.map((r) => r.toJSON()));
  }),
);

router.post(
  '/',
  interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
  helpers.async(async (req, res) => {
    const { exportId } = req.body ?? {};
    if (!exportId) {
      res.status(HttpStatus.BAD_REQUEST).end();
      return;
    }
    const exp = await models.Export.findByPk(exportId);
    if (!exp) {
      res.status(HttpStatus.BAD_REQUEST).end();
      return;
    }
    const record = models.ExportTrigger.build(_.pick(req.body, ['exportId', 'type', 'debounceTime', 'isEnabled']));
    if (exp.isOverridable) {
      record.set(_.pick(req.body, ['username', 'password', 'organization']));
    }
    if (!exp.isApprovalReqd) {
      record.approvedAt = new Date();
      record.approvedById = req.user.id;
    }
    if (req.user.isAdmin && req.body.agencyId) {
      record.agencyId = req.body.agencyId;
    } else if (req.agency) {
      record.agencyId = req.agency.id;
    } else {
      res.status(HttpStatus.BAD_REQUEST).end();
      return;
    }
    record.createdById = req.user.id;
    record.updatedById = req.user.id;
    await record.save();
    res.status(HttpStatus.CREATED).json(record.toJSON());
  }),
);

router.patch(
  '/:id/approve',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    let record;
    await models.sequelize.transaction(async (transaction) => {
      record = await models.ExportTrigger.findByPk(req.params.id, {
        transaction,
      });
      if (record && !record.approvedAt) {
        record.approvedAt = new Date();
        record.approvedById = req.user.id;
        record.updatedById = req.user.id;
        await record.save({
          transaction,
        });
      }
    });
    if (record) {
      res.json(record.toJSON());
    } else {
      res.status(HttpStatus.NOT_FOUND).end();
    }
  }),
);

router.get(
  '/:id',
  interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
  helpers.async(async (req, res) => {
    const record = await models.ExportTrigger.findByPk(req.params.id);
    if (record) {
      if (req.user.isAdmin || record.agencyId === req.agency.id) {
        res.json(record.toJSON());
      } else {
        res.status(HttpStatus.FORBIDDEN).end();
      }
    } else {
      res.status(HttpStatus.NOT_FOUND).end();
    }
  }),
);

router.patch(
  '/:id',
  interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
  helpers.async(async (req, res) => {
    let record;
    let isAllowed;
    await models.sequelize.transaction(async (transaction) => {
      record = await models.ExportTrigger.findByPk(req.params.id, {
        include: ['export'],
        transaction,
      });
      if (record) {
        isAllowed = req.user.isAdmin || record.agencyId === req.agency.id;
        if (isAllowed) {
          record.set(_.pick(req.body, ['type', 'debounceTime', 'isEnabled']));
          if (record.export.isOverridable) {
            record.set(_.pick(req.body, ['username', 'password', 'organization']));
          }
          record.updatedBy = req.user;
          await record.save({
            transaction,
          });
        }
      }
    });
    if (record) {
      if (isAllowed) {
        const data = record.toJSON();
        delete data.export;
        res.json(data);
      } else {
        res.status(HttpStatus.FORBIDDEN).end();
      }
    } else {
      res.status(HttpStatus.NOT_FOUND).end();
    }
  }),
);

router.delete(
  '/:id',
  interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
  helpers.async(async (req, res) => {
    let record;
    let isAllowed;
    await models.sequelize.transaction(async (transaction) => {
      record = await models.ExportTrigger.findByPk(req.params.id, { transaction });
      if (record) {
        isAllowed = req.user.isAdmin || record.agencyId === req.agency.id;
        if (isAllowed) {
          await record.destroy({ transaction });
        }
      }
    });
    if (record) {
      if (isAllowed) {
        res.status(HttpStatus.OK).end();
      } else {
        req.status(HttpStatus.FORBIDDEN).end();
      }
    } else {
      res.status(HttpStatus.NOT_FOUND).end();
    }
  }),
);

module.exports = router;
