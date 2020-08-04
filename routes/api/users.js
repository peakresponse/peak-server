'use strict';

const express = require('express');
const HttpStatus = require('http-status-codes');

const models = require('../../models');
const helpers = require('../helpers');
const interceptors = require('../interceptors');

const router = express.Router();

router.get('/', interceptors.requireAdmin(), helpers.async(async function(req, res, next) {
  const {docs, pages, total} = await models.User.paginate({
    page: req.query.page || 1,
    order: [['last_name', 'ASC'], ['first_name', 'ASC'], ['email', 'ASC']]
  });
  res.json(docs.map(d => d.toJSON()));
}));

router.get('/me', interceptors.requireLogin(), function(req, res, next) {
  res.json(req.user.toJSON());
});

router.get('/:id', interceptors.requireAdmin(), helpers.async(async function(req, res, next) {
  const user = await models.User.findByPk(req.params.id);
  if (user) {
    res.json(user.toJSON());
  } else {
    res.status(HttpStatus.NOT_FOUND).end();
  }
}));

router.patch('/:id', interceptors.requireAdmin(), helpers.async(async function(req, res, next) {
  let user;
  await models.sequelize.transaction(async function(transaction) {
    user = await models.User.findByPk(req.params.id, {transaction});
    if (user) {
      await helpers.handleUpload(user, "iconUrl", req.body.iconUrl, 'users/icon');
      await user.update({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        iconUrl: user.iconUrl,
        password: req.body.password
      }, {transaction});
    }
  });
  if (user) {
    res.json(user.toJSON());
  } else {
    res.status(HttpStatus.NOT_FOUND).end();
  }
}));

module.exports = router;
