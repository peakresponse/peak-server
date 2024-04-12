/* eslint-disable mocha/no-top-level-hooks, mocha/no-hooks-for-single-case, mocha/no-exports */

/// MUST BE FIRST! set the NODE_ENV to test to disable logging, switch to test db
process.env.NODE_ENV = 'test';
process.env.ASSET_PATH_PREFIX = 'test';
/// override any custom base host/url
process.env.BASE_HOST = 'peakresponse.localhost';
process.env.BASE_URL = 'http://peakresponse.localhost:3000';
process.env.EXPRESS_SUBDOMAIN_OFFSET = '2';
process.env.MODEL_EXPORT_AES_KEY = 'atFRHRK2gSapTqgJZxpl4ffqsOaUXUpoLbVw3D9Z6kc=';
process.env.MODEL_REGION_AES_KEY = 'oelWGGK8epK1c0m8jbL7zX4QKgXf9MAntuFuOTWlsGo=';

const fixtures = require('sequelize-fixtures');
const fs = require('fs-extra');
const { mkdirp } = require('mkdirp');
const nock = require('nock');
const nodemailerMock = require('nodemailer-mock');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const models = require('../models');
const s3 = require('../lib/aws/s3');

function loadFixtures(files) {
  const filePaths = files.map((f) => path.resolve(__dirname, `fixtures/${f}.json`));
  return models.sequelize.transaction((transaction) => fixtures.loadFiles(filePaths, models, { transaction }));
}

function recordNetworkRequests() {
  nock.recorder.rec();
}

async function uploadFile(file) {
  const tmpFile = `${uuidv4()}${path.extname(file)}`;
  if (process.env.AWS_S3_BUCKET) {
    await s3.putObject({ Key: path.join('uploads', tmpFile), filePath: path.resolve(__dirname, `fixtures/files/${file}`) });
  } else {
    mkdirp.sync(path.resolve(__dirname, '../tmp/uploads'));
    fs.copySync(path.resolve(__dirname, `fixtures/files/${file}`), path.resolve(__dirname, `../tmp/uploads/${tmpFile}`));
  }
  return tmpFile;
}

function assetPathExists(assetPath) {
  if (process.env.AWS_S3_BUCKET) {
    return s3.objectExists({ Key: path.join(process.env.ASSET_PATH_PREFIX, assetPath) });
  }
  return fs.pathExistsSync(path.resolve(__dirname, '../public/assets', process.env.ASSET_PATH_PREFIX, assetPath));
}

async function cleanUploadedAssets() {
  if (process.env.AWS_S3_BUCKET) {
    await s3.deleteObjects({ Prefix: process.env.ASSET_PATH_PREFIX });
  } else {
    fs.removeSync(path.resolve(__dirname, `../tmp/uploads`));
    fs.removeSync(path.resolve(__dirname, `../public/assets/${process.env.ASSET_PATH_PREFIX}`));
  }
}

async function resetDatabase() {
  /// clear all test data (order matters due to foreign key relationships)
  await models.sequelize.query(`
    DELETE FROM guide_items;
    DELETE FROM guide_sections;
    DELETE FROM guides;
    DELETE FROM export_logs;
    DELETE FROM export_triggers;
    DELETE FROM exports;
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
    DELETE FROM incidents_agencies;
    DELETE FROM incidents;
    DELETE FROM dispatchers;
    UPDATE scenes SET mgs_responder_id=NULL, triage_responder_id=NULL, treatment_responder_id=NULL, staging_responder_id=NULL, transport_responder_id=NULL;
    DELETE FROM responders;    
    DELETE FROM scene_observations;
    DELETE FROM scene_pins;
    DELETE FROM scenes;
    DELETE FROM configurations;
    DELETE FROM contacts;
    DELETE FROM custom_configurations;
    DELETE FROM devices;
    DELETE FROM employments;
    DELETE FROM region_facilities;
    DELETE FROM facilities;
    DELETE FROM forms;
    DELETE FROM locations;
    DELETE FROM vehicles;
    UPDATE agencies SET version_id=NULL;
    DELETE FROM versions;
    DELETE FROM region_agencies;
    DELETE FROM agencies;
    DELETE FROM regions;
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
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

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
  assetPathExists,
  cleanUploadedAssets,
  loadFixtures,
  recordNetworkRequests,
  resetDatabase,
  sleep,
  uploadFile,
};
