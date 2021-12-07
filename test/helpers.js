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

const loadFixtures = (files) => {
  const filePaths = files.map((f) => path.resolve(__dirname, `fixtures/${f}.json`));
  return models.sequelize.transaction((transaction) => {
    return fixtures.loadFiles(filePaths, models, { transaction });
  });
};

const recordNetworkRequests = () => {
  nock.recorder.rec();
};

const resetDatabase = async () => {
  /// clear all test data (order matters due to foreign key relationships)
  await models.sequelize.query(`
    DELETE FROM list_items;
    DELETE FROM list_sections;
    DELETE FROM lists;
    DELETE FROM reports_medications;
    DELETE FROM reports_procedures;
    DELETE FROM reports_vitals;
    DELETE FROM reports;
    DELETE FROM vitals;
    DELETE FROM medications;
    DELETE FROM procedures;
    DELETE FROM responses;
    DELETE FROM situations;
    DELETE FROM times;
    DELETE FROM dispositions;
    DELETE FROM histories;
    DELETE FROM narratives;
    DELETE FROM patient_observations;
    DELETE FROM patients;
    DELETE FROM dispatches;
    DELETE FROM assignments;
    DELETE FROM vehicles;
    DELETE FROM incidents;
    DELETE FROM dispatchers;
    DELETE FROM psaps;
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
