'use strict';

const express = require('express');
const fs = require('fs');
const HttpStatus = require('http-status-codes');
const path = require('path');

const models = require('../../../models');
const helpers = require('../../helpers');

const router = express.Router();

router.get('/validate', helpers.async(async function(req, res, next) {
  if (req.query.subdomain) {
    const subdomain = req.query.subdomain;
    try {
      /// validate that it is a valid value
      let agency = await models.DemAgency.build({subdomain});
      await agency.validate();
      /// check if it already exists
      agency = await models.DemAgency.findOne({attributes: ['id'], where: {subdomain}});
      if (agency) {
        res.status(HttpStatus.CONFLICT).end();
      }
      res.status(HttpStatus.NO_CONTENT).end();
    } catch (err) { }
  }
  res.status(HttpStatus.UNPROCESSABLE_ENTITY).end();
}));

router.post('/', helpers.async(async function(req, res, next) {
  /// get the source State Agency record (i.e. imported from NEMSIS repo)
  const sAgency = await models.Agency.findByPk(req.body.agencyId);
  if (!sAgency) return res.status(HttpStatus.NOT_FOUND).end();
  /// perform creation in transaction
  await models.sequelize.transaction(async transaction => {
    /// create User record
    const user = await models.User.register(req.body, {transaction});
    /// create the Demographic Agency record clone
    const agency = await models.DemAgency.register(user, sAgency, req.body.subdomain, {transaction});
    /// if created without error, now send welcome email
    await user.sendWelcomeEmail(agency, {transaction});
    /// log in the newly created user
    req.login(user, err => {
      if (err) {
        throw err;
      }
      /// return id, name, subdomain, and default invite message
      res.status(HttpStatus.CREATED).json({
        id: agency.id,
        name: agency.name,
        subdomain: agency.subdomain,
        message: agency.getLocalizedInvitationMessage(res)
      });
    });
  });
}));

const basename = path.basename(__filename);
fs.readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    router.use(`/${path.basename(file, '.js')}`, require(path.resolve(__dirname, file)));
  });

module.exports = router;
