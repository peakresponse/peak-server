const express = require('express');
const HttpStatus = require('http-status-codes');

const helpers = require('../helpers');
const interceptors = require('../interceptors');
const models = require('../../models');
const nemsisStates = require('../../lib/nemsis/states');

const router = express.Router();

router.get(
  '/',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    const page = req.query.page || 1;
    const options = {
      page,
      include: ['state'],
      order: [
        ['state', 'name', 'ASC'],
        ['version', 'DESC'],
      ],
    };
    const { stateId } = req.query ?? {};
    if (stateId) {
      options.where = { stateId };
    }
    const { docs, pages, total } = await models.NemsisStateDataSet.paginate(options);
    helpers.setPaginationHeaders(req, res, page, pages, total);
    res.json(docs.map((r) => r.toJSON()));
  })
);

router.post(
  '/',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    const { stateId, version } = req.body;
    let record;
    if (stateId && version) {
      const repo = nemsisStates.getNemsisStateRepo(stateId, '3.5.0');
      await repo.pull();
      await repo.install(version);
      const stateDataSetParser = repo.getDataSetParser(version);
      const nemsisVersion = await stateDataSetParser.getNemsisVersion();
      record = await models.NemsisStateDataSet.create({
        stateId,
        nemsisVersion,
        version,
        createdById: req.user.id,
        updatedById: req.user.id,
      });
    }
    if (record) {
      res.status(HttpStatus.CREATED).json(record.toJSON());
    } else {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).end();
    }
  })
);

module.exports = router;
