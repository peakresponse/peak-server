const express = require('express');

const models = require('../../models');

const helpers = require('../helpers');
const interceptors = require('../interceptors');

const router = express.Router();

router.get(
  '/',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    const lists = await models.List.findAll({
      where: {
        agencyId: null,
      },
    });
    // TODO: merge with agency-specific list override customizations
    const listIds = lists.map((l) => l.id);
    const sections = await models.ListSection.findAll({
      where: {
        listId: listIds,
      },
    });
    const items = await models.ListItem.findAll({
      where: {
        listId: listIds,
      },
    });
    const data = {
      lists: lists.map((l) => l.toJSON()),
      sections: sections.map((s) => s.toJSON()),
      items: items.map((i) => i.toJSON()),
    };
    res.json(data);
  })
);

module.exports = router;
