const express = require('express');

const HttpStatus = require('http-status-codes');
const models = require('../../models');

const { Op } = models.Sequelize;

const helpers = require('../helpers');

const router = express.Router();

router.get(
  '/',
  helpers.async(async (req, res) => {
    const page = req.query.page || 1;
    const options = {
      page,
      where: {},
      include: [{ model: models.State, as: 'state' }],
      order: [['name', 'ASC']],
    };
    if (req.query.search && req.query.search !== '') {
      options.where.name = { [Op.iLike]: `%${req.query.search.trim()}%` };
    }
    if (req.query.stateId && req.query.stateId !== '') {
      options.where.stateId = req.query.stateId;
    }
    const { docs, pages, total } = await models.Agency.scope('canonical').paginate(options);
    helpers.setPaginationHeaders(req, res, page, pages, total);
    res.json(docs.map((r) => r.toJSON()));
  })
);

router.get('/me', (req, res) => {
  if (!req.agency) {
    res.status(HttpStatus.NOT_FOUND).end();
  } else {
    const data = req.agency.toJSON();
    data.message = req.agency.getLocalizedInvitationMessage(res);
    res.json(data);
  }
});

router.get(
  '/validate',
  helpers.async(async (req, res) => {
    if (req.query.subdomain) {
      const { subdomain } = req.query;
      try {
        /// validate that it is a valid value
        let agency = await models.Agency.build({ subdomain });
        await agency.validate();
        /// check if it already exists
        agency = await models.Agency.findOne({
          attributes: ['id'],
          where: { subdomain },
        });
        if (agency) {
          res.status(HttpStatus.CONFLICT).end();
        }
        res.status(HttpStatus.NO_CONTENT).end();
      } catch (err) {
        /// fallthrough
      }
    }
    res.status(HttpStatus.UNPROCESSABLE_ENTITY).end();
  })
);

router.get(
  '/:id',
  helpers.async(async (req, res) => {
    /// check for a claimed agency record
    const record = await models.Agency.scope('claimed').findOne({
      where: { canonicalAgencyId: req.params.id },
    });
    if (record) {
      /// send back limited details only
      res.json({
        id: record.id,
        name: record.name,
        subdomain: record.subdomain,
        message: record.getLocalizedInvitationMessage(res),
      });
    } else {
      /// new send a suggested subdomain
      const agency = await models.Agency.findByPk(req.params.id);
      if (agency) {
        const subdomain = await agency.generateSubdomain();
        res.status(HttpStatus.NOT_FOUND).json({ subdomain });
      } else {
        res.status(HttpStatus.UNPROCESSABLE_ENTITY).end();
      }
    }
  })
);

router.post(
  '/:id/claim',
  helpers.async(async (req, res) => {
    /// get the source State Agency record (i.e. imported from NEMSIS repo)
    const canonicalAgency = await models.Agency.findByPk(req.params.id);
    if (!canonicalAgency) {
      res.status(HttpStatus.NOT_FOUND).end();
      return;
    }
    /// perform creation in transaction
    await models.sequelize.transaction(async (transaction) => {
      /// create User record
      const user = await models.User.register(req.body, { transaction });
      /// create the Demographic Agency record clone
      const agency = await models.Agency.register(user, canonicalAgency, req.body.subdomain, { transaction });
      /// if created without error, now send welcome email
      await user.sendWelcomeEmail(agency, { transaction });
      /// log in the newly created user
      req.login(user, (err) => {
        if (err) {
          throw err;
        }
        /// return id, name, subdomain, and default invite message
        res.status(HttpStatus.CREATED).json({
          id: agency.id,
          name: agency.name,
          subdomain: agency.subdomain,
          message: agency.getLocalizedInvitationMessage(res),
        });
      });
    });
  })
);

module.exports = router;
