const fs = require('fs');
const _ = require('lodash');
const Sequelize = require('sequelize');
const xmlFormatter = require('xml-formatter');
const xmljs = require('xml-js');
const { validateXMLWithXSD } = require('validate-with-xmllint');

const nemsisPublic = require('./public');

// re-order any nested elements in data object to match the ordering in the schema
// this is needed because the compact js representation of xml can lose ordering during serialization
function reorder(schema, data, isInArray) {
  // check if this contains a nested sequence of elements
  let elements = schema?.['xs:complexType']?.['xs:sequence']?.['xs:element'];
  if (elements) {
    let reorderedData;
    if (Array.isArray(data)) {
      // when we have a collection of multiple values, we recursively re-order each value's data
      reorderedData = [];
      for (const value of data) {
        reorderedData.push(reorder(schema, value, true));
      }
    } else {
      // begin reordering the data
      reorderedData = {};
      // capture any attributes
      if (data._attributes) {
        reorderedData._attributes = data._attributes;
      }
      // iterate over each element
      if (!Array.isArray(elements)) {
        elements = [elements];
      }
      for (const e of elements) {
        // for each named element, extract its value and add it to the new reorderedData object
        const name = e._attributes?.name;
        if (name) {
          const value = data[name];
          if (value) {
            // recursively process the value, in case it too has a nested sequence of elements
            const isInGroup = !schema?._attributes.name && elements.length === 1;
            reorderedData[name] = reorder(e, value, isInGroup);
          }
        }
      }
    }
    if (!isInArray && schema?._attributes?.maxOccurs === 'unbounded' && !Array.isArray(reorderedData)) {
      return [reorderedData];
    }
    return reorderedData;
  }
  // if not a nested sequence of elements, simply return the data as-is
  return data;
}

function generate(nemsisVersion, xsdPath, rootTag, groupTag, data) {
  // wrap data such that it can be validated
  const doc = {};
  if (groupTag) {
    doc[rootTag] = { [groupTag]: data };
  } else {
    // destructure and create a new object, since it's going
    // to have its attributes modified below
    doc[rootTag] = { ...data };
  }
  doc[rootTag]._attributes = {
    ...(doc[rootTag]._attributes ?? {}),
    xmlns: 'http://www.nemsis.org',
    'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
  };
  // get the source xsd and open
  const repo = nemsisPublic.getNemsisPublicRepo(nemsisVersion);
  const xsd = xmljs.xml2js(fs.readFileSync(repo.xsdPath(xsdPath)).toString(), {
    compact: true,
  });
  // reorder per the xsd
  doc[rootTag] = reorder(xsd['xs:schema'], doc[rootTag]);
  return doc;
}

// returns a full JSON path to the element on the specified line
function getErrorPath(doc, lines, lineNum) {
  const errorPath = [];
  const stack = [];
  let lineCount = 0;
  let indent = 0;
  for (const line of lines) {
    const m = line.match(/^(\t*)<([^! >/]+)/);
    if (m) {
      const lineIndent = m[1].split('\t').length - 1;
      const element = m[2];
      if (lineIndent === 0) {
        errorPath.push(`['${element}']`);
        stack.push(doc[element]);
      } else if (lineIndent > indent) {
        const node = stack[indent][element];
        if (Array.isArray(node)) {
          errorPath.push(`['${element}'][0]`);
          stack.push(node[0]);
        } else {
          errorPath.push(`['${element}']`);
          stack.push(node);
        }
        indent = lineIndent;
      } else if (lineIndent <= indent) {
        let prev;
        while (lineIndent <= indent) {
          errorPath.pop();
          prev = stack.pop();
          indent -= 1;
        }
        const node = stack[indent][element];
        if (Array.isArray(node)) {
          const index = node.indexOf(prev) + 1;
          errorPath.push(`['${element}'][${index}]`);
          stack.push(node[index]);
        } else {
          errorPath.push(`['${element}']`);
          stack.push(node);
        }
        indent = lineIndent;
      }
    }
    lineCount += 1;
    if (lineCount === lineNum) {
      break;
    }
  }
  return `$${errorPath.join('')}`;
}

async function validate(doc, xml, xsdPath) {
  const xmlValidationErrorReport = {
    totalErrorCount: 0,
  };
  try {
    await validateXMLWithXSD(xml, xsdPath);
  } catch (err) {
    // console.log(err);
    const lines = xml.split('\n');
    const errors = [];
    xmlValidationErrorReport.xmlError = [];
    for (const m of err.message.matchAll(/-:(\d+): element ([^:]+): Schemas validity error : (Element '[^']+': ([^\n]*))/g)) {
      xmlValidationErrorReport.totalErrorCount += 1;
      const [, lineNum, elementName, fullMessage, message] = m;
      // gather error as formatted for web services XML response
      xmlValidationErrorReport.xmlError.push({
        desc: fullMessage,
        failedElementList: {
          xmlElementInfo: [
            {
              elementName,
              elementLocation: {
                line: parseInt(lineNum, 10),
              },
            },
          ],
        },
      });
      // gather error as used for model validation
      if (doc) {
        const errorPath = getErrorPath(doc, lines, parseInt(lineNum, 10));
        if (!_.find(errors, { path: errorPath })) {
          const [, expected] = message.match(/This element is not expected. Expected is \( ((?:[^ ]+ )+)\)/) ?? [];
          if (expected) {
            const fields = expected
              .trim()
              .split(' ')
              .map((f) => {
                const fm = f.match(/(?:\{[^}]+\})?(.+)/);
                return fm[1];
              });
            errors.push(
              new Sequelize.ValidationErrorItem(
                `This field is not expected. Expected fields are: ${fields.join(', ')}.`,
                'Validation error',
                errorPath,
                null
              )
            );
          } else {
            const [, value] = message.match(/(?:\[facet '[^']+'\] The value )?(?:'([^']*)')?/);
            if (value === '' || value === undefined) {
              errors.push(new Sequelize.ValidationErrorItem('This field is required.', 'Validation error', errorPath, value));
            } else {
              errors.push(new Sequelize.ValidationErrorItem('This is not a valid value.', 'Validation error', errorPath, value));
            }
          }
        }
      }
    }
    if (doc) {
      xmlValidationErrorReport.$json = {
        name: 'SchemaValidationError',
        errors: errors.map((e) => _.pick(e, ['path', 'message', 'value'])),
      };
    }
  }
  return xmlValidationErrorReport.totalErrorCount ? xmlValidationErrorReport : null;
}

async function validateDemDataSet(nemsisVersion, xml, doc) {
  const repo = nemsisPublic.getNemsisPublicRepo(nemsisVersion);
  const xsdPath = repo.demDataSetXsdPath;
  return validate(
    doc ?? xmljs.xml2js(xml, { compact: true }),
    xmlFormatter(xml, { collapseContent: true, lineSeparator: '\n', indentation: '\t' }),
    xsdPath
  );
}

async function validateEmsDataSet(nemsisVersion, xml, doc) {
  const repo = nemsisPublic.getNemsisPublicRepo(nemsisVersion);
  const xsdPath = repo.emsDataSetXsdPath;
  return validate(
    doc ?? xmljs.xml2js(xml, { compact: true }),
    xmlFormatter(xml, { collapseContent: true, lineSeparator: '\n', indentation: '\t' }),
    xsdPath
  );
}

async function validateElement(nemsisVersion, xsdPath, rootTag, groupTag, data) {
  // generate document
  const doc = generate(nemsisVersion, xsdPath, rootTag, groupTag, data);
  // convert to xml
  const xml = xmlFormatter(xmljs.js2xml(doc, { compact: true }), { collapseContent: true, lineSeparator: '\n', indentation: '\t' });
  // get the wrapper xsd
  const repo = nemsisPublic.getNemsisPublicRepo(nemsisVersion);
  const xsdWrapperPath = repo.xsdWrapperPath(xsdPath);
  const errorReport = await validate(doc, xml, xsdWrapperPath);
  if (errorReport?.$json?.errors) {
    for (const error of errorReport.$json.errors) {
      error.path = error.path.replace(`['${rootTag}']`, '');
    }
  }
  return errorReport;
}

module.exports = {
  generate,
  validate,
  validateDemDataSet,
  validateEmsDataSet,
  validateElement,
};
