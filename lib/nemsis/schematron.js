const fs = require('fs');
const shelljs = require('shelljs');
const tmp = require('tmp');
const xmlFormatter = require('xml-formatter');
const xmljs = require('xml-js');

const nemsisPublic = require('./public');

async function validate(xml, schPath) {
  const formattedXml = xmlFormatter(xml, { collapseContent: true, lineSeparator: '\n', indentation: '\t' });
  const srcFileObj = tmp.fileSync();
  const dstFilePath = tmp.tmpNameSync();
  const schematronReport = {
    completeSchematronReport: {},
  };
  try {
    fs.writeFileSync(srcFileObj.fd, formattedXml);
    if (shelljs.exec(`bin/xslt ${srcFileObj.name} ${schPath} ${dstFilePath}`).code === 0) {
      const svrl = fs.readFileSync(dstFilePath, 'utf8');
      schematronReport.completeSchematronReport.$xml = svrl.replace(/<\?xml[^?]*\?>\s*/, '');
      const json = xmljs.xml2js(svrl, { compact: true });
      if (!('svrl:failed-assert' in json['svrl:schematron-output'])) {
        return null;
      }
      schematronReport.completeSchematronReport.$json = json;
    }
  } finally {
    srcFileObj.removeCallback();
    if (fs.existsSync(dstFilePath)) {
      fs.unlinkSync(dstFilePath);
    }
  }
  return schematronReport;
}

async function validateDemDataSet(nemsisVersion, xml) {
  const repo = nemsisPublic.getNemsisPublicRepo(nemsisVersion);
  const schPath = repo.demDataSetSchematronXslPath;
  return validate(xml, schPath);
}

module.exports = {
  validate,
  validateDemDataSet,
};
