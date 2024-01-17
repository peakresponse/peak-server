const express = require('express');
const HttpStatus = require('http-status-codes');

const models = require('../../models');

const helpers = require('../helpers');
const interceptors = require('../interceptors');

const router = express.Router();

router.get(
  '/',
  interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
  helpers.async(async (req, res) => {
    const { exportId, exportTriggerId, page = '1' } = req.query ?? {};
    const options = {
      include: ['export', 'exportTrigger'],
      where: {},
      order: [['createdAt', 'DESC']],
      page,
    };
    if (exportId) {
      options.where.exportId = exportId;
    }
    if (exportTriggerId) {
      options.where.exportTriggerId = exportTriggerId;
    }
    if (!req.user.isAdmin) {
      if (req.agency) {
        options.include[1] = { model: models.ExportTrigger, as: 'exportTrigger', where: { agencyId: req.agency.id } };
      } else {
        res.status(HttpStatus.BAD_REQUEST).end();
        return;
      }
    }
    const { docs, pages, total } = await models.ExportLog.paginate(options);
    helpers.setPaginationHeaders(req, res, page, pages, total);
    res.json(docs.map((r) => r.toJSON()));
  }),
);

router.get(
  '/:id',
  interceptors.requireAgency(models.Employment.Roles.CONFIGURATION),
  helpers.async(async (req, res) => {
    const record = await models.ExportLog.findByPk(req.params.id, {
      include: ['export', 'exportTrigger'],
    });
    if (record) {
      if (req.user.isAdmin || record.exportTrigger.agencyId === req.agency.id) {
        res.json(record.toJSON());
      } else {
        res.status(HttpStatus.FORBIDDEN).end();
      }
    } else {
      res.status(HttpStatus.NOT_FOUND).end();
    }
  }),
);

module.exports = router;
