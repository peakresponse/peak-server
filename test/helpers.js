'use strict'

/// MUST BE FIRST! set the NODE_ENV to test to disable logging, switch to test db
process.env.NODE_ENV = 'test';

const fixtures = require('sequelize-fixtures');
const nock = require('nock');
const nodemailerMock = require('nodemailer-mock');
const path = require('path');

const models = require('../models');

const loadFixtures = async function(files) {
  files = files.map(f => path.resolve(__dirname, `fixtures/${f}.json`));
  await fixtures.loadFiles(files, models);
};

const recordNetworkRequests = function() {
  nock.recorder.rec();
}

const resetDatabase = async function() {
  /// clear all test data (order matters due to foreign key relationships)
  await models.sequelize.query(`
    DELETE FROM demographics.contacts;
    DELETE FROM demographics.employments;
    DELETE FROM demographics.agencies;
    DELETE FROM observations;
    DELETE FROM patients;
    DELETE FROM facilities;
    DELETE FROM agencies;
    DELETE FROM users;
    DELETE FROM states;
  `);
};

const sleep = function(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

beforeEach(async function() {
  await resetDatabase();
  nodemailerMock.mock.reset();
});

after(async function() {
  /// close all db connections
  await models.sequelize.close();
});

module.exports = {
  loadFixtures,
  recordNetworkRequests,
  resetDatabase,
  sleep
};
