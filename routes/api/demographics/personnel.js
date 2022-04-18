const express = require('express');
const HttpStatus = require('http-status-codes');
const _ = require('lodash');
const { Op } = require('sequelize');

const cache = require('../../../lib/cache');
const models = require('../../../models');
const helpers = require('../../helpers');
const interceptors = require('../../interceptors');

const router = express.Router();

router.get(
  '/',
  interceptors.requireAgency(models.Employment.Roles.PERSONNEL),
  helpers.async(async (req, res) => {
    const page = req.query.page || 1;
    const options = {
      page,
      where: { agencyId: req.agency.id },
      order: [
        ['last_name', 'ASC NULLS FIRST'],
        ['first_name', 'ASC NULLS FIRST'],
        ['middle_name', 'ASC NULLS FIRST'],
        ['email', 'ASC'],
      ],
    };
    if (req.query.search) {
      const search = req.query.search.trim();
      if (search !== '') {
        options.where[Op.or] = {
          firstName: { [Op.iLike]: `%${search}%` },
          lastName: { [Op.iLike]: `%${search}%` },
          middleName: { [Op.iLike]: `%${search}%` },
          email: { [Op.iLike]: `%${search}%` },
        };
      }
    }
    const { docs, pages, total } = await models.Employment.paginate(options);
    helpers.setPaginationHeaders(req, res, page, pages, total);
    res.json(docs.map((d) => d.toJSON()));
  })
);

router.post(
  '/',
  interceptors.requireAgency(models.Employment.Roles.PERSONNEL),
  helpers.async(async (req, res) => {
    const record = await models.Employment.create({
      ..._.pick(req.body, ['firstName', 'lastName', 'email', 'data']),
      agencyId: req.agency.id,
      createdById: req.user.id,
      updatedById: req.user.id,
    });
    res.status(HttpStatus.CREATED).json(record.toJSON());
  })
);

router.post(
  '/invite',
  interceptors.requireAgency(models.Employment.Roles.PERSONNEL),
  helpers.async(async (req, res) => {
    const { rows } = req.body;
    if (Array.isArray(rows)) {
      const status = {
        code: HttpStatus.ACCEPTED,
        total: rows.length,
        sent: 0,
        failed: [],
      };
      cache.set(`personnel-invite-${req.user.id}`, status, 6 * 3600);
      res.status(HttpStatus.ACCEPTED).end();
      for (const row of rows) {
        try {
          // eslint-disable-next-line no-await-in-loop
          await models.Employment.create({
            fullName: row.fullName,
            email: row.email,
            agencyId: req.agency.id,
            createdById: req.user.id,
            updatedById: req.user.id,
          });
          status.sent += 1;
        } catch (error) {
          status.failed.push(row.email);
        }
        cache.set(`personnel-invite-${req.user.id}`, status, 6 * 3600);
      }
      status.code = HttpStatus.OK;
      cache.set(`personnel-invite-${req.user.id}`, status, 6 * 3600);
      return;
    }
    res.status(HttpStatus.UNPROCESSABLE_ENTITY).end();
  })
);

router.get(
  '/invite-status',
  interceptors.requireAgency(models.Employment.Roles.PERSONNEL),
  helpers.async(async (req, res) => {
    const status = cache.get(`personnel-invite-${req.user.id}`);
    if (status) {
      res.status(status.code).json(status);
    } else {
      res.status(HttpStatus.NOT_FOUND).end();
    }
  })
);

router.post(
  '/accept',
  helpers.async(async (req, res) => {
    const { invitationCode } = req.body;
    let user;
    let status;
    await models.sequelize.transaction(async (transaction) => {
      /// attempt to register
      user = await models.User.register(req.body, { transaction });
      let employment;
      if (invitationCode) {
        /// look up the corresponding employment record, associate
        try {
          employment = await models.Employment.findOne({
            where: {
              invitationCode: req.body.invitationCode,
            },
            rejectOnEmpty: true,
            transaction,
          });
        } catch {
          res.status(HttpStatus.NOT_FOUND).end();
          return;
        }
      } else {
        /// look for an employment with a matching email
        employment = await models.Employment.findOne({
          where: {
            email: user.email,
          },
          transaction,
        });
      }
      if (employment && employment.invitationCode) {
        /// associate with employment, clear invitation code
        employment.setUser(user);
        employment.invitationCode = null;
        employment.updatedById = user.id;
        await employment.save({ transaction });
        /// finally, send welcome email
        await user.sendWelcomeEmail(req.agency, { transaction });
        status = HttpStatus.CREATED;
      } else {
        /// create a pending employment
        if (!employment) {
          employment = models.Employment.build();
          employment.agencyId = req.agency.id;
          employment.createdById = user.id;
        }
        /// mark pending
        employment.setUser(user);
        employment.isPending = true;
        employment.updatedById = user.id;
        await employment.save({ transaction });
        /// finally, send welcome email (will be a pending request email)
        await user.sendWelcomeEmail(req.agency, { transaction });
        status = HttpStatus.ACCEPTED;
      }
    });
    res.status(status).json(user.toJSON());
  })
);

router.get(
  '/:id',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    const record = await models.Employment.findOne({
      where: {
        id: req.params.id,
        agencyId: req.agency.id,
      },
      include: ['user'],
    });
    if (record) {
      res.json(record.toJSON());
    } else {
      res.status(HttpStatus.NOT_FOUND).end();
    }
  })
);

router.put(
  '/:id',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    let record;
    await models.sequelize.transaction(async (transaction) => {
      record = await models.Employment.findOne({
        where: {
          id: req.params.id,
          agencyId: req.agency.id,
        },
        include: ['user'],
        transaction,
      });
      if (record) {
        record = await record.update(_.pick(req.body, ['data']), { transaction });
        if (!record.isValid) {
          throw record.validationError;
        }
        const { user } = record;
        if (user) {
          user.setFromEmployment(record);
          user.set(_.pick(req.body.user, ['position']));
          await user.save({ transaction });
        }
      }
    });
    if (record) {
      res.json(record.toJSON());
    } else {
      res.status(HttpStatus.NOT_FOUND).end();
    }
  })
);

router.post(
  '/:id/resend-invitation',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    let record;
    await models.sequelize.transaction(async (transaction) => {
      record = await models.Employment.findOne({
        where: {
          id: req.params.id,
          agencyId: req.agency.id,
        },
        include: ['user'],
        transaction,
      });
      if (record && record.invitationCode) {
        await record.sendInvitationEmail({ transaction });
        await record.update({ invitationAt: new Date() }, { hooks: false, validate: false, transaction });
      }
    });
    if (record) {
      res.status(HttpStatus.NO_CONTENT).end();
    } else {
      res.status(HttpStatus.NOT_FOUND).end();
    }
  })
);

module.exports = router;
