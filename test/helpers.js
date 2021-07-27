/* eslint-disable mocha/no-top-level-hooks, mocha/no-hooks-for-single-case, mocha/no-exports */

/// MUST BE FIRST! set the NODE_ENV to test to disable logging, switch to test db
process.env.NODE_ENV = 'test';
/// handle files as local
process.env.AWS_S3_BUCKET = '';
/// override any custom base host/url
process.env.BASE_HOST = 'peakresponse.localhost';
process.env.BASE_URL = 'http://peakresponse.localhost:3000';
process.env.EXPRESS_SUBDOMAIN_OFFSET = '2';

const fixtures = require('sequelize-fixtures');
const nock = require('nock');
const nodemailerMock = require('nodemailer-mock');
const path = require('path');

const models = require('../models');

const loadFixtures = async (files) => {
  const filePaths = files.map((f) => path.resolve(__dirname, `fixtures/${f}.json`));
  await fixtures.loadFiles(filePaths, models);
};

const recordNetworkRequests = () => {
  nock.recorder.rec();
};

const resetDatabase = async () => {
  /// clear all test data (order matters due to foreign key relationships)
  await models.sequelize.query(`
    DELETE FROM vehicles;
    DELETE FROM patient_observations;
    DELETE FROM patients;
    DELETE from psaps;
    DELETE FROM responders;
    DELETE FROM scene_observations;
    DELETE FROM scene_pins;
    DELETE FROM scenes;
    DELETE FROM contacts;
    DELETE FROM employments;
    DELETE FROM agencies;
    DELETE FROM facilities;
    DELETE FROM agencies;
    DELETE FROM users;
    DELETE FROM states;
    DELETE FROM counties;
    DELETE FROM cities;
  `);
};

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

beforeEach(async () => {
  await resetDatabase();
  nodemailerMock.mock.reset();
});

after(async () => {
  /// close all db connections
  await models.sequelize.close();
});

module.exports = {
  loadFixtures,
  recordNetworkRequests,
  resetDatabase,
  sleep,
};
