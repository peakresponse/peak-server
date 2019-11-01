'use strict';

const express = require('express');
const router = express.Router();
const models = require('../../models');
const interceptors = require('../interceptors');
const helpers = require('../helpers');

router.get('/', interceptors.requireLogin, function(req, res, next) {
  models.Transport.findAll({
    order: [['name', 'ASC']]
  }).then(function(records) {
    res.json(records.map(r => r.toJSON()));
  });
});

router.post('/', interceptors.requireLogin, function(req, res, next) {
  models.sequelize.transaction(function(transaction) {
    return models.Transport.findOrCreate({
      where: { name: req.body.name },
      defaults: { createdById: req.user.id, updatedById: req.user.id },
      transaction
    }).then(function([record, created]) {
      return record.update({
        name: req.body.name,
        updatedById: req.user.id
      }, {transaction});
    });
  }).then(function(record){
    res.json(record.toJSON());
  }).catch(function(error) {
    console.log(error);
    if (error.name == 'SequelizeValidationError') {
      res.status(422).json({
        status: 422,
        messages: error.errors
      });
    } else {
      res.sendStatus(500);
    }
  });
});

module.exports = router;
