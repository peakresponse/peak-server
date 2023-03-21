const fs = require('fs');
const xmljs = require('xml-js');
const nemsisPublic = require('./public');

// re-order any nested elements in data object to match the ordering in the schema
// this is needed because the compact js representation of xml can lose ordering during serialization
function reorder(schema, data) {
  // check if this is a nested sequence of elements
  let elements = schema?.['xs:complexType']?.['xs:sequence']?.['xs:element'];
  if (elements) {
    let reorderedData;
    if (Array.isArray(data)) {
      // when we have a collection of multiple values, we recursively re-order each value's data
      reorderedData = [];
      for (const value of data) {
        reorderedData.push(reorder(schema, value));
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
            reorderedData[name] = reorder(e, value);
          }
        }
      }
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
    doc[rootTag] = { groupTag: data };
  } else {
    doc[rootTag] = data;
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

function validate() {}

module.exports = {
  generate,
  validate,
};
