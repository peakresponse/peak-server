'use strict'

const fetch = require('node-fetch');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const shelljs = require('shelljs');
const tmp = require('tmp');
const xmljs = require('xml-js');
const XLSX = require('xlsx');

const BASE_URL = 'https://stash.utahdcc.org/stash';
const API_BASE_URL = `${BASE_URL}/rest/api/1.0`;

/// download the specified files in the specified repo
const downloadRepoFiles = function(repo, files) {
  const tmpDir = tmp.dirSync();
  const promises = [];
  for (let filePath of files) {
    const ext = path.extname(filePath);
    if (['.xml', '.xlsx'].includes(ext)) {
      promises.push(new Promise((resolve, reject) => {
        const fileUrl = `${BASE_URL}/projects/NES/repos/${repo}/raw/${filePath}`;
        fetch(`${BASE_URL}/projects/NES/repos/${repo}/raw/${filePath}`)
          .then(res => {
            const destPath = path.resolve(tmpDir.name, filePath);
            mkdirp.sync(path.dirname(destPath));
            const dest = fs.createWriteStream(destPath);
            dest.on('error', err => reject(err));
            dest.on('finish', () => resolve(destPath));
            res.body.pipe(dest);
          })
          .catch(err => reject(err));
      }));
    }
  }
  return Promise.all(promises).then(files => tmpDir);
};

/// fetch the list of repos from the NEMSIS states project
const getStateRepos = function() {
  return fetch(`${API_BASE_URL}/projects/NES/repos?limit=100`)
    .then(res => res.json());
};

/// get the files in the given state repo
const getStateRepoFiles = function(repo) {
  return fetch(`${API_BASE_URL}/projects/NES/repos/${repo}/files?limit=100`)
    .then(res => res.json());
};

/// parse an XLSX spreadsheet at the given path
const parseSpreadsheet = function(filePath) {
  return new Promise((resolve, reject) => {
    const workbook = XLSX.readFile(filePath);
    /// for now, just take the first sheet
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);
    resolve({rows});
  });
};

/// parse a StateDataSet file at the given path
const parseStateDataSet = function(filePath) {
  return new Promise((resolve, reject) => {
    let xml = fs.readFileSync(filePath).toString();
    let json = xmljs.xml2js(xml, {compact: true});
    /// check the version of the data
    const m = json.StateDataSet._attributes['xsi:schemaLocation'].match(/nemsis_v\d\/(\d+\.\d+\.\d+)\.([^\/]+)\//);
    if (m) {
      if (m[1].startsWith('3.4')) {
        /// transform into 3.5
        const destFilePath = `${filePath}.v350`;
        if (shelljs.exec(`bin/xslt ${filePath} nemsis/xslt/STATE-v340_to_v350.xslt ${destFilePath}`).code == 0) {
          xml = fs.readFileSync(destFilePath).toString();
          json = xmljs.xml2js(xml, {compact: true});
          resolve({xml, json});
          return;
        }
      } else if (m[1].startsWith('3.5')) {
        resolve({xml, json});
        return
      }
    }
    reject(new Error('Unsupported schema version'));
  });
};

module.exports = {
  california: require('./nemsis/california'),
  commonTypes: require('./nemsis/commonTypes'),
  getStateRepos,
  getStateRepoFiles,
  downloadRepoFiles,
  parseSpreadsheet,
  parseStateDataSet,
};
