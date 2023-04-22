const express = require('express');
const HttpStatus = require('http-status-codes');
const _ = require('lodash');

const models = require('../../models');
const helpers = require('../helpers');
const interceptors = require('../interceptors');

const { Op } = models.Sequelize;
const router = express.Router();

router.get(
  '/',
  helpers.async(async (req, res) => {
    const page = req.query.page || 1;
    const options = {
      page,
      include: [{ model: models.State, as: 'state' }],
      order: [['name', 'ASC']],
    };
    if (req.user?.isAdmin) {
      options.include.push({ model: models.Agency, as: 'claimedAgency', required: false });
    }
    const conditions = [];
    if (req.query.search && req.query.search !== '') {
      conditions.push({
        [Op.or]: [
          { stateUniqueId: { [Op.iLike]: `%${req.query.search.trim()}%` } },
          { number: { [Op.iLike]: `%${req.query.search.trim()}%` } },
          { name: { [Op.iLike]: `%${req.query.search.trim()}%` } },
        ],
      });
    }
    if (req.query.stateId && req.query.stateId !== '') {
      conditions.push({
        stateId: req.query.stateId,
      });
    }
    if (conditions.length > 0) {
      options.where = {
        [Op.and]: conditions,
      };
    }
    const { docs, pages, total } = await models.Agency.scope('canonical').paginate(options);
    helpers.setPaginationHeaders(req, res, page, pages, total);
    res.json(docs.map((r) => (req.user?.isAdmin ? r.toJSON() : r.toPublicJSON())));
  })
);

router.post(
  '/',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    const agency = await models.Agency.create({
      stateUniqueId: req.body.stateUniqueId,
      number: req.body.number,
      name: req.body.name,
      stateId: req.body.stateId,
      data: {
        'sAgency.01': {
          _text: req.body.stateUniqueId,
        },
        'sAgency.02': {
          _text: req.body.number,
        },
        'sAgency.03': {
          _text: req.body.name,
        },
      },
      updatedById: req.user.id,
      createdById: req.user.id,
    });
    res.status(HttpStatus.CREATED).json(agency.toJSON());
  })
);

router.get(
  '/me',
  interceptors.requireLogin,
  helpers.async(async (req, res) => {
    if (!req.agency) {
      res.status(HttpStatus.NOT_FOUND).end();
    } else {
      const data = req.agency.toJSON();
      data.message = req.agency.getLocalizedInvitationMessage(res);
      const version = await req.agency.getVersion({ include: ['stateDataSet'] });
      data.version = version?.toJSON();
      const draftVersion = await req.agency.getDraftVersion();
      data.draftVersion = draftVersion?.toJSON();
      res.json(data);
    }
  })
);

router.get(
  '/validate',
  helpers.async(async (req, res) => {
    if (req.query.subdomain) {
      const { subdomain } = req.query;
      try {
        /// validate that it is a valid value
        let agency = await models.Agency.build({
          stateUniqueId: 'placeholder',
          number: 'placeholder',
          subdomain,
        });
        await agency.validate();
        /// check if it already exists
        agency = await models.Agency.findOne({
          attributes: ['id'],
          where: { subdomain, isDraft: false },
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
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    const agency = await models.Agency.findByPk(req.params.id, {
      include: [{ model: models.Agency, as: 'claimedAgency', required: false }, 'stateDataSet'],
    });
    if (agency) {
      res.json(agency.toJSON());
    } else {
      res.send(HttpStatus.NOT_FOUND).end();
    }
  })
);

router.patch(
  '/:id',
  interceptors.requireAdmin,
  helpers.async(async (req, res) => {
    let agency;
    await models.sequelize.transaction(async (transaction) => {
      agency = await models.Agency.findByPk(req.params.id, { transaction });
      if (agency) {
        const attributes = ['nemsisVersion', 'stateDataSetId', 'stateId', 'stateUniqueId', 'number', 'name'];
        if (agency.isClaimed) {
          attributes.push('psapId', 'subdomain', 'routedUrl');
        }
        await agency.update(_.pick(req.body, attributes), { transaction });
      }
    });
    if (agency) {
      res.json(agency.toJSON());
    } else {
      res.send(HttpStatus.NOT_FOUND).end();
    }
  })
);

router.get(
  '/:id/check',
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
