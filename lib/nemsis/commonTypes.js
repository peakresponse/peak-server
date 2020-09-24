const fs = require('fs');
const path = require('path');
const xmljs = require('xml-js');

/// get the enumerated types from the XSDs
const commonTypes = {
  enums: {},
};

const xml = fs
  .readFileSync(path.resolve(__dirname, '../../nemsis/xsd/commonTypes_v3.xsd'))
  .toString();
const json = xmljs.xml2js(xml, { compact: true });
if (json['xs:schema'] && json['xs:schema']['xs:simpleType']) {
  for (const simpleType of json['xs:schema']['xs:simpleType']) {
    if (
      simpleType['xs:restriction'] &&
      simpleType['xs:restriction']['xs:enumeration']
    ) {
      const typeName = simpleType._attributes.name;
      const typeData = {
        values: [],
        nameMapping: {},
        valueMapping: {},
      };
      let enums = simpleType['xs:restriction']['xs:enumeration'];
      if (!Array.isArray(enums)) {
        enums = [enums];
      }
      for (const en of enums) {
        const name = en['xs:annotation']['xs:documentation']._text;
        const { value } = en._attributes;
        typeData.values.push({ name, value });
        typeData.nameMapping[name] = value;
        typeData.valueMapping[value] = name;
      }
      commonTypes.enums[typeName] = typeData;
    }
  }
}

module.exports = commonTypes;
