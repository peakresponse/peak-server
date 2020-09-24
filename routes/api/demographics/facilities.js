const express = require('express');
const HttpStatus = require('http-status-codes');

const models = require('../../../models');
const helpers = require('../../helpers');
const interceptors = require('../../interceptors');

const router = express.Router();

router.get(
  '/',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    const page = req.query.page || 1;
    const { docs, pages, total } = await models.Facility.paginate({
      page,
      where: { createdByAgencyId: req.agency.id },
      order: [
        ['type', 'ASC'],
        ['name', 'ASC'],
        ['location_code', 'ASC'],
      ],
    });
    helpers.setPaginationHeaders(req, res, page, pages, total);
    res.json({
      dFacility: {
        dFacilityGroup: docs.map((d) => d.data),
      },
    });
  })
);

router.post(
  '/',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    const record = await models.Facility.create({
      data: req.body,
      updatedById: req.user.id,
      createdById: req.user.id,
      createdByAgencyId: req.agency.id,
    });
    if (record.isValid) {
      res.status(HttpStatus.CREATED).json(record.data);
    } else {
      throw record.validationError;
    }
  })
);

router.put(
  '/:id',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    let record = await models.Facility.findOne({
      where: {
        id: req.params.id,
        createdByAgencyId: req.agency.id,
      },
    });
    if (record) {
      record = await record.update({ data: req.body });
      if (record.isValid) {
        res.status(HttpStatus.NO_CONTENT).end();
      } else {
        throw record.validationError;
      }
    } else {
      res.status(HttpStatus.NOT_FOUND).end();
    }
  })
);

module.exports = router;
