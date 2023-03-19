const express = require('express');
const HttpStatus = require('http-status-codes');

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
  })
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
        res.status(HttpStatus.FORBIDDEN).end();
      }
    } else {
      res.status(HttpStatus.NOT_FOUND).end();
    }
  })
);

module.exports = router;
