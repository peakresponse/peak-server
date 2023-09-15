const fs = require('fs');
const shelljs = require('shelljs');
const tmp = require('tmp');
const xmlFormatter = require('xml-formatter');
const xmljs = require('xml-js');

const nemsisPublic = require('./public');

async function validate(doc, xml, schXslPath) {
  const formattedXml = xmlFormatter(xml, { collapseContent: true, lineSeparator: '\n', indentation: '\t' });
  const srcFileObj = tmp.fileSync();
  const dstFilePath = tmp.tmpNameSync();
  const completeSchematronReport = {};
  try {
    fs.writeFileSync(srcFileObj.fd, formattedXml);
    if (shelljs.exec(`bin/xslt ${srcFileObj.name} ${schXslPath} ${dstFilePath}`).code === 0) {
      const svrl = fs.readFileSync(dstFilePath, 'utf8');
      completeSchematronReport.$xml = svrl.replace(/<\?xml[^?]*\?>\s*/, '');
      const json = xmljs.xml2js(svrl, { compact: true });
      if (!('svrl:failed-assert' in json['svrl:schematron-output'])) {
        return null;
      }
      if (doc) {
        completeSchematronReport.$json = json;
      }
    }
  } finally {
    srcFileObj.removeCallback();
    if (fs.existsSync(dstFilePath)) {
      fs.unlinkSync(dstFilePath);
    }
  }
  return completeSchematronReport;
}

async function validateDataSet(xml, schXslPath) {
  return validate(
    xmljs.xml2js(xml, { compact: true }),
    xmlFormatter(xml, { collapseContent: true, lineSeparator: '\n', indentation: '\t' }),
    schXslPath
  );
}

async function validateDemDataSet(nemsisVersion, xml) {
  const repo = nemsisPublic.getNemsisPublicRepo(nemsisVersion);
  const schXslPath = repo.demDataSetSchematronXslPath;
  return validateDataSet(xml, schXslPath);
}

module.exports = {
  validate,
  validateDataSet,
  validateDemDataSet,
};
