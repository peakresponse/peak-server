const express = require('express');
const HttpStatus = require('http-status-codes');
const xmlFormatter = require('xml-formatter');
const xmljs = require('xml-js');

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
  '/:id/preview',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    const version = await models.Version.findByPk(req.params.id);
    if (version) {
      if (version.agencyId === req.agency.id) {
        res.set('Content-Type', 'application/xml');
        const xml = xmlFormatter(xmljs.js2xml(version.demDataSet, { compact: true }), {
          collapseContent: true,
          lineSeparator: '\n',
          indentation: '\t',
        });
        res.send(xml);
      } else {
        res.status(HttpStatus.FORBIDDEN).end();
      }
    } else {
      res.status(HttpStatus.NOT_FOUND).end();
    }
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
