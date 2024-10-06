const express = require('express');
const { StatusCodes } = require('http-status-codes');

const cache = require('../../../lib/cache');
const models = require('../../../models');
const helpers = require('../../helpers');
const interceptors = require('../../interceptors');
const base = require('./base');

const router = express.Router();

router.get(
  '/invite/:invitationCode',
  helpers.async(async (req, res) => {
    const { invitationCode } = req.params;
    let record;
    try {
      record = await models.Employment.findOne({
        where: { invitationCode },
      });
    } catch {
      // no-op
    }
    if (record) {
      const { email, invitationAt } = record;
      res.json({ email, invitationAt });
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  }),
);

router.post(
  '/invite',
  interceptors.requireAgency(models.Employment.Roles.PERSONNEL),
  helpers.async(async (req, res) => {
    const { rows } = req.body;
    if (Array.isArray(rows)) {
      const status = {
        code: StatusCodes.ACCEPTED,
        total: rows.length,
        sent: 0,
        failed: [],
      };
      cache.set(`personnel-invite-${req.user.id}`, status, 6 * 3600);
      res.status(StatusCodes.ACCEPTED).end();
      for (const row of rows) {
        try {
          // eslint-disable-next-line no-await-in-loop
          await models.Employment.create({
            fullName: row.fullName,
            email: row.email,
            createdByAgencyId: req.agency.id,
            createdById: req.user.id,
            updatedById: req.user.id,
          });
          status.sent += 1;
        } catch (error) {
          status.failed.push(row.email);
        }
        cache.set(`personnel-invite-${req.user.id}`, status, 6 * 3600);
      }
      status.code = StatusCodes.OK;
      cache.set(`personnel-invite-${req.user.id}`, status, 6 * 3600);
      return;
    }
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).end();
  }),
);

router.get(
  '/invite-status',
  interceptors.requireAgency(models.Employment.Roles.PERSONNEL),
  helpers.async(async (req, res) => {
    const status = cache.get(`personnel-invite-${req.user.id}`);
    if (status) {
      res.status(status.code).json(status);
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  }),
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
          employment = await models.Employment.scope('finalOrNew').findOne({
            where: {
              invitationCode: req.body.invitationCode,
            },
            rejectOnEmpty: true,
            transaction,
          });
        } catch {
          res.status(StatusCodes.NOT_FOUND).end();
          return;
        }
      } else {
        /// look for an employment with a matching email
        employment = await models.Employment.scope('finalOrNew').findOne({
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
        status = StatusCodes.CREATED;
      } else {
        /// create a pending employment
        if (!employment) {
          employment = models.Employment.build();
          employment.createdByAgencyId = req.agency.id;
          employment.createdById = user.id;
        }
        /// mark pending
        employment.setUser(user);
        employment.isPending = true;
        employment.updatedById = user.id;
        await employment.save({ transaction });
        /// finally, send welcome email (will be a pending request email)
        await user.sendWelcomeEmail(req.agency, { transaction });
        status = StatusCodes.ACCEPTED;
      }
    });
    res.status(status).json(user.toJSON());
  }),
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
          createdByAgencyId: req.agency.id,
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
      res.status(StatusCodes.NO_CONTENT).end();
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  }),
);

base.addAllRoutes(router, models.Employment, {
  index: {
    order: [
      ['last_name', 'ASC NULLS FIRST'],
      ['first_name', 'ASC NULLS FIRST'],
      ['middle_name', 'ASC NULLS FIRST'],
      ['email', 'ASC'],
    ],
    searchFields: ['last_name', 'first_name', 'middle_name', 'email'],
    serializer(docs) {
      return docs.map((d) => d.toJSON());
    },
  },
});

module.exports = router;
