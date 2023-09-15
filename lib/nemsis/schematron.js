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
        const errors = [];
        let failedAsserts = json['svrl:schematron-output']['svrl:failed-assert'];
        if (!Array.isArray(failedAsserts)) {
          failedAsserts = [failedAsserts];
        }
        for (const failedAssert of failedAsserts) {
          const id = failedAssert['svrl:diagnostic-reference']?.nemsisDiagnostic?.record?.UUID?._text;
          const message = (failedAssert['svrl:text']?._text ?? '').trim();
          const value = failedAssert['svrl:diagnostic-reference']?.nemsisDiagnostic?.elements?.element?._text;
          const location = failedAssert._attributes?.location;
          let components = location?.split('/*:');
          components?.shift();
          components = components?.map((part) => part.match(/([^[]+)(?:\[namespace-uri\(\)='[^']+'\])(?:\[(\d+)\])/));
          let node = doc;
          let path = '$';
          for (const component of components) {
            const [, element] = component;
            node = node[element];
            path = `${path}[${element}]`;
            if (Array.isArray(node)) {
              let [, , index] = component;
              index = parseInt(index, 10) - 1;
              path = `${path}[${index}]`;
              node = node[index];
            }
          }
          errors.push({
            id,
            path,
            message,
            value,
          });
        }
        completeSchematronReport.$json = {
          name: 'SchemaValidationError',
          errors,
        };
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
