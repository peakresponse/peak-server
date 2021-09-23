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
    const { docs, pages, total } = await models.Employment.paginate({
      page,
      where: { agencyId: req.agency.id },
      order: [
        ['last_name', 'ASC'],
        ['first_name', 'ASC'],
        ['middle_name', 'ASC'],
      ],
    });
    helpers.setPaginationHeaders(req, res, page, pages, total);
    res.json({
      dPersonnel: {
        'dPersonnel.PersonnelGroup': docs.map((d) => d.data),
      },
    });
  })
);

router.post(
  '/',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    const record = await models.Employment.create({
      agencyId: req.agency.id,
      data: req.body,
      createdById: req.user.id,
      updatedById: req.user.id,
    });
    if (record.isValid) {
      res.status(HttpStatus.CREATED).json(record.data);
    } else {
      throw record.validationError;
    }
  })
);

router.post(
  '/invite',
  interceptors.requireAgency(models.Employment.Roles.PERSONNEL),
  helpers.async(async (req, res) => {
    const { rows } = req.body;
    if (Array.isArray(rows)) {
      await models.sequelize.transaction(async (transaction) => {
        await Promise.all(
          rows.map((row) =>
            models.Employment.create(
              {
                fullName: row.fullName,
                email: row.email,
                agencyId: req.agency.id,
                createdById: req.user.id,
                updatedById: req.user.id,
              },
              { transaction }
            )
          )
        );
      });
      res.status(HttpStatus.NO_CONTENT).end();
    }
    res.status(HttpStatus.UNPROCESSABLE_ENTITY).end();
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
        /// associate with employment, clear invitation code so it can't re-used
        employment.userId = user.id;
        employment.invitationCode = null;
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
          employment.updatedById = user.id;
        }
        /// mark pending
        employment.userId = user.id;
        employment.isPending = true;
        await employment.save({ transaction });
        /// finally, send welcome email (will be a pending request email)
        await user.sendWelcomeEmail(req.agency, { transaction });
        status = HttpStatus.ACCEPTED;
      }
    });
    res.status(status).json(user.toJSON());
  })
);

router.put(
  '/:id',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    let record = await models.Employment.findOne({
      where: {
        id: req.params.id,
        agencyId: req.agency.id,
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
