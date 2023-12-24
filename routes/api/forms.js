const express = require('express');

const models = require('../../models');

const helpers = require('../helpers');
const interceptors = require('../interceptors');

const router = express.Router();

router.get(
  '/',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    const options = {
      where: { createdByAgencyId: req.agency.id, canonicalId: null, archivedAt: null },
      order: [['title', 'ASC']],
    };
    const records = await models.Form.findAll(options);
    res.json(records.map((r) => r.toJSON()));
  }),
);

module.exports = router;
