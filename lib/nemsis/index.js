const fetch = require('node-fetch');
const fs = require('fs');
const _ = require('lodash');
const mkdirp = require('mkdirp');
const path = require('path');
const Sequelize = require('sequelize');
const shelljs = require('shelljs');
const tmp = require('tmp');
const { validateXMLWithXSD } = require('validate-with-xmllint');
const xmljs = require('xml-js');

const BASE_URL = 'https://git.nemsis.org';
const API_BASE_URL = `${BASE_URL}/rest/api/1.0`;

/// download the specified files in the specified repo
const downloadRepoFiles = (repo, files) => {
  const tmpDir = tmp.dirSync();
  const promises = [];
  for (const filePath of files) {
    const ext = path.extname(filePath);
    if (['.xml', '.xlsx'].includes(ext)) {
      promises.push(
        new Promise((resolve, reject) => {
          fetch(`${BASE_URL}/projects/NES/repos/${repo}/raw/${filePath}?at=refs%2Fheads%2Frelease-3.5.0`)
            .then((res) => {
              const destPath = path.resolve(tmpDir.name, filePath);
              mkdirp.sync(path.dirname(destPath));
              const dest = fs.createWriteStream(destPath);
              dest.on('error', (err) => reject(err));
              dest.on('finish', () => resolve(destPath));
              res.body.pipe(dest);
            })
            .catch((err) => reject(err));
        })
      );
    }
  }
  return Promise.all(promises).then(() => tmpDir);
};

/// fetch the list of repos from the NEMSIS states project
const getStateRepos = () => {
  return fetch(`${API_BASE_URL}/projects/NES/repos?limit=100`).then((res) => res.json());
};

/// get the files in the given state repo
const getStateRepoFiles = (repo) => {
  return fetch(`${API_BASE_URL}/projects/NES/repos/${repo}/files?limit=100&at=refs%2Fheads%2Frelease-3.5.0`).then((res) => res.json());
};

/// parse a StateDataSet file at the given path
const parseStateDataSet = (filePath) => {
  return new Promise((resolve, reject) => {
    let xml = fs.readFileSync(filePath).toString();
    let json = xmljs.xml2js(xml, { compact: true });
    /// check the version of the data
    const m = json.StateDataSet._attributes['xsi:schemaLocation'].match(/nemsis_v\d\/(\d+\.\d+\.\d+)\.([^/]+)\//);
    if (m) {
      if (m[1].startsWith('3.4')) {
        /// transform into 3.5
        const destFilePath = `${filePath}.v350`;
        if (shelljs.exec(`bin/xslt ${filePath} nemsis/xslt/STATE-v340_to_v350.xslt ${destFilePath}`).code === 0) {
          xml = fs.readFileSync(destFilePath).toString();
          json = xmljs.xml2js(xml, { compact: true });
          resolve({ xml, json });
          return;
        }
      } else if (m[1].startsWith('3.5')) {
        resolve({ xml, json });
        return;
      }
    }
    reject(new Error('Unsupported schema version'));
  });
};

const reorderData = (element, data) => {
  let elements = element?.['xs:complexType']?.['xs:sequence']?.['xs:element'];
  if (elements) {
    const reorderedData = {};
    if (data._attributes) {
      reorderedData._attributes = data._attributes;
    }
    if (!Array.isArray(elements)) {
      elements = [elements];
    }
    for (const e of elements) {
      const name = e._attributes?.name;
      if (name) {
        const value = data[name];
        if (value) {
          reorderedData[name] = reorderData(e, value);
        }
      }
    }
    return reorderedData;
  }
  return data;
};

const validateSchema = async (xsdPath, rootTag, groupTag, rawData) => {
  const data = { ...rawData };
  /// remove the custom isValid attribute if present
  if (_.has(data, ['_attributes', 'pr:isValid'])) {
    delete data._attributes['pr:isValid'];
  }
  /// wrap data such that it can be validated
  const doc = {};
  if (groupTag) {
    _.set(doc, [rootTag, groupTag], data);
  } else {
    doc[rootTag] = data;
  }
  doc[rootTag]._attributes = { ...(doc[rootTag]._attributes || {}) };
  _.assign(doc[rootTag]._attributes, {
    xmlns: 'http://www.nemsis.org',
    'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
  });
  /// set up both the individual validation wrapper path and the source xsd
  const individualXsdPath = path.resolve(__dirname, '../../nemsis/xsd/wrappers', xsdPath);
  const sourceXsdPath = path.resolve(__dirname, '../../nemsis/xsd', xsdPath);
  /// open the xsd
  const xsd = xmljs.xml2js(fs.readFileSync(sourceXsdPath).toString(), {
    compact: true,
  });
  doc[rootTag] = reorderData(xsd['xs:schema'], doc[rootTag]);
  /// convert to xml
  const xml = xmljs.js2xml(doc, { compact: true });
  /// validate against xsd
  try {
    await validateXMLWithXSD(xml, individualXsdPath);
    return null;
  } catch (err) {
    /// TODO parse error for specified field validation messages to return
    const errors = [];
    // console.log(err.message);
    for (const m of err.message.matchAll(
      /element ([^:]+): Schemas validity error : Element '[^']+': \[facet '[^']+'\] The value (?:'([^']*)')?/g
    )) {
      if (!_.find(errors, { path: m[1] })) {
        errors.push(new Sequelize.ValidationErrorItem('This is not a valid value.', 'Validation error', m[1], m[2]));
      }
    }
    return new Sequelize.ValidationError('Schema validation error', errors);
  }
};

module.exports = {
  getStateRepos,
  getStateRepoFiles,
  downloadRepoFiles,
  parseStateDataSet,
  validateSchema,
};
