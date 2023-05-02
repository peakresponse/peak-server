/* eslint-disable mocha/no-top-level-hooks, mocha/no-hooks-for-single-case, mocha/no-exports */

/// MUST BE FIRST! set the NODE_ENV to test to disable logging, switch to test db
process.env.NODE_ENV = 'test';
/// handle files as local, in a test subdir
process.env.AWS_S3_BUCKET = '';
process.env.ASSET_PATH_PREFIX = 'test';
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
    DELETE FROM reports_signatures;
    DELETE FROM reports_files;
    DELETE FROM reports_medications;
    DELETE FROM reports_procedures;
    DELETE FROM reports_vitals;
    DELETE FROM reports;
    DELETE FROM signatures;
    DELETE FROM files;
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
    DELETE FROM incidents;
    DELETE FROM dispatchers;
    UPDATE scenes SET mgs_responder_id=NULL, triage_responder_id=NULL, treatment_responder_id=NULL, staging_responder_id=NULL, transport_responder_id=NULL;
    DELETE FROM responders;    
    DELETE FROM scene_observations;
    DELETE FROM scene_pins;
    DELETE FROM scenes;
    DELETE FROM configurations;
    DELETE FROM contacts;
    DELETE FROM devices;
    DELETE FROM employments;
    DELETE FROM facilities;
    DELETE FROM forms;
    DELETE FROM locations;
    DELETE FROM vehicles;
    UPDATE agencies SET version_id=NULL;
    DELETE FROM versions;
    DELETE FROM agencies;
    DELETE FROM nemsis_state_data_sets;
    DELETE FROM nemsis_schematrons;
    DELETE FROM psaps;
    DELETE FROM agencies;
    DELETE FROM tokens;
    DELETE FROM clients;
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
  await resetDatabase();
  await models.sequelize.close();
});

module.exports = {
  loadFixtures,
  recordNetworkRequests,
  resetDatabase,
  sleep,
};
