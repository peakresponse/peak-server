'use strict';

const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const HttpStatus = require('http-status-codes');
const path = require('path');

const models = require('../../models');
const interceptors = require('../interceptors');
const helpers = require('../helpers');
const nemsis = require('../../lib/nemsis');
const {City, State} = require('../../lib/codes');

const router = express.Router();

router.get('/', interceptors.requireLogin, function(req, res, next) {
  models.State.findAll({
    order: [['name', 'ASC']]
  }).then(function(records) {
    res.json(records.map(r => r.toJSON()));
  });
});

router.get('/new', interceptors.requireAdmin, function(req, res, next) {
  /// fetch the list of repos from the NEMSIS states project
  nemsis.getStateRepos()
    .then(json => res.json(json));
});

router.post('/', interceptors.requireAdmin, helpers.async(async function(req, res, next) {
  const repo = req.body.repo;
  const name = req.body.name;
  const code = State.nameMapping[name] ? State.nameMapping[name].code : null;
  if (!code) {
    return res.sendStatus(500);
  }
  let state = null;
  await models.sequelize.transaction(async transaction => {
    /// check if already exists
    state = await models.State.findOne({where: {code}, transaction});
    /// if not, create, store everything...
    if (!state) {
      /// create State record
      state = await models.State.create({
        name,
        code,
        dataSet: {status: 'Downloading state data from NEMSIS...'}
      }, {transaction});
      /// send back ACCEPTED state while processing continues in background
      res.status(202).json(state);
    } else {
      /// already exists!
      state = null;
      res.status(422).json({
        status: 422,
        messages: [{path: 'repo', message: 'This State has already been added.'}]
      });
    }
  });
  if (!state) {
    return;
  }
  /// now start processing NEMSIS data in background...
  const files = await nemsis.getStateRepoFiles(repo);
  const tmpDir = await nemsis.downloadRepoFiles(repo, files.values);
  try {
    await state.update({dataSet: {status: 'Processing downloaded state data...'}});
    let dataSet = null;
    let schematronXml = null;
    let facilitySpreadsheet = null;
    for (let filePath of files.values) {
      if (filePath.startsWith('Resources') && filePath.endsWith('StateDataSet.xml')) {
        dataSet = await nemsis.parseStateDataSet(path.resolve(tmpDir.name, filePath));
      } else if (filePath.startsWith('Resources') && filePath.endsWith('Facilities.xlsx')) {
        facilitySpreadsheet = await nemsis.parseSpreadsheet(path.resolve(tmpDir.name, filePath));
      } else if (filePath.startsWith('Schematron') && filePath.endsWith('EMSDataSet.sch.xml')) {
        schematronXml = fs.readFileSync(path.resolve(tmpDir.name, filePath));
      }
    }
    if (!dataSet) {
      state.dataSet = {};
      await state.save();
      return;
    }
    /// special-case handling for california which has an Excel spreadsheet for their facilities
    if (repo == 'california' && facilitySpreadsheet) {
        /// convert to sFacility records and add
        dataSet.json.StateDataSet.sFacility = await nemsis.california.parseFacilitySpreadsheet(facilitySpreadsheet);
    }
    /// add associated Agencies
    await state.update({dataSet: {status: 'Populating state agencies...'}});
    if (dataSet.json.StateDataSet.sAgency && dataSet.json.StateDataSet.sAgency.sAgencyGroup) {
      await models.sequelize.transaction(async transaction => {
        for (let sAgency of dataSet.json.StateDataSet.sAgency.sAgencyGroup) {
          const [agency, ] = await models.Agency.findOrBuild({
            where: {
              stateId: state.id,
              stateNumber: sAgency['sAgency.01']._text
            },
            transaction
          });
          agency.number = sAgency['sAgency.02']._text;
          agency.name = sAgency['sAgency.03']._text;
          agency.dataSet = sAgency;
          await agency.save({transaction});
        }
      });
    }
    /// add associated Facilities
    await state.update({dataSet: {status: 'Populating state facilities...'}});
    if (dataSet.json.StateDataSet.sFacility && dataSet.json.StateDataSet.sFacility.sFacilityGroup) {
      await models.sequelize.transaction(async transaction => {
        for (let sFacilityGroup of dataSet.json.StateDataSet.sFacility.sFacilityGroup) {
          const type = sFacilityGroup['sFacility.01']._text;
          if (sFacilityGroup['sFacility.FacilityGroup']) {
            for (let sFacility of sFacilityGroup['sFacility.FacilityGroup']) {
              const [facility, ] = await models.Facility.findOrBuild({
                where: {
                  stateCode: sFacility['sFacility.09'] ? sFacility['sFacility.09']._text : null,
                  code: sFacility['sFacility.03'] ? sFacility['sFacility.03']._text : null
                },
                transaction
              });
              facility.type = type;
              facility.name = sFacility['sFacility.02']._text;
              facility.unit = sFacility['sFacility.06'] ? sFacility['sFacility.06']._text : null;
              facility.address = sFacility['sFacility.07'] ? sFacility['sFacility.07']._text : null;
              facility.city = sFacility['sFacility.08'] ? await City.getName(sFacility['sFacility.08']._text) : null;
              facility.state = sFacility['sFacility.09'] ? await State.codeMapping[sFacility['sFacility.09']._text].abbr : null;
              facility.zip = sFacility['sFacility.10'] ? sFacility['sFacility.10']._text : null;
              if (sFacility['sFacility.13']) {
                const m = sFacility['sFacility.13']._text.match(/([-\d\.]+),([-\d\.]+)/);
                if (m) {
                  facility.lat = m[1];
                  facility.lng = m[2];
                }
              } else if (process.env.NODE_ENV != 'test') {
                /// don't perform in test, so we don't exceed request quotas
                facility.geocode();
              }
              facility.dataSet = sFacility;
              await facility.save({transaction});
            }
          }
        }
      });
    }
    state.dataSet = dataSet.json;
    state.dataSetXml = dataSet.xml;
    state.schematronXml = schematronXml;
    await state.save();
  } catch(error) {
    console.log(error);
    state.dataSet = {};
    await state.save();
  } finally {
    tmpDir.removeCallback();
  }
}));

router.get('/:id', helpers.async(async function(req, res, next) {
  const id = req.params.id;
  const state = await models.State.unscoped().findOne({where: {id}, attributes: {exclude: ['dataSetXml', 'schematronXml']}});
  if (state) {
    if (state.dataSet.status) {
      res.setHeader('X-Status', state.dataSet.status);
    }
    res.status(state.dataSet.status ? HttpStatus.ACCEPTED : HttpStatus.OK).json(state);
  } else {
    res.sendStatus(HttpStatus.NOT_FOUND);
  }
}));

module.exports = router;
