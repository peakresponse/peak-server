const _ = require('lodash');

const { NEMSIS_VERSION_REGEXP, XmlParser } = require('./xmlParser');

class NemsisStateDataSetParser extends XmlParser {
  constructor(filePath, version) {
    super(filePath);
    this.version = version;
  }

  getNemsisVersion() {
    return this.parse((stream, parser, stack, resolve, reject) => {
      parser.on('startElement', (name, attr) => {
        if (name === 'StateDataSet') {
          const m = attr?.['xsi:schemaLocation']?.match(NEMSIS_VERSION_REGEXP);
          if (m) {
            resolve(m[1]);
          } else {
            reject();
          }
        }
      });
    });
  }

  getStateId() {
    return this.parse((stream, parser, stack, resolve) => {
      parser.on('startElement', (name) => {
        if (name === 'sState.01') {
          stack.push({});
        }
      });
      parser.on('endElement', (name) => {
        if (name === 'sState.01') {
          const state = stack.pop();
          resolve(state._text);
        }
      });
    });
  }

  onStartElement(name, attr) {
    if (name === 'StateDataSet') {
      const m = attr?.['xsi:schemaLocation']?.match(NEMSIS_VERSION_REGEXP);
      this.other.dataSetNemsisVersion = m?.[1];
    } else if (name === 'sState.01') {
      this.stack.push({});
    } else {
      super.onStartElement(name, attr);
    }
  }

  onEndElement(name) {
    if (name === 'StateDataSet') {
      this.resolve();
    } else if (name === 'sState.01') {
      this.other[name] = this.stack.pop();
    } else {
      super.onEndElement(name);
    }
  }

  parseAgencies(callback) {
    return this.parseElement('sAgency', 'sAgencyGroup', callback);
  }

  parseConfiguration(callback) {
    return this.parseElement('sConfiguration', null, callback);
  }

  parseDEMCustomConfiguration(callback) {
    return this.parseElement('sdCustomConfiguration', 'sdCustomConfiguration.CustomGroup', callback);
  }

  parseFacilities(callback) {
    return this.parseElement(
      'sFacility',
      'sFacility.FacilityGroup',
      callback,
      null,
      (stack, name, attr) => {
        if (name === 'sFacility.01') {
          const element = {};
          if (!_.isEmpty(attr)) {
            element._attributes = attr;
          }
          stack.push(element);
          return true;
        }
        return false;
      },
      (stack, name, other) => {
        if (name === 'sFacility.01') {
          other[name] = stack.pop();
          return true;
        }
        if (name === 'sFacilityGroup') {
          delete other['sFacility.01'];
          return true;
        }
        return false;
      },
    );
  }
}

module.exports = {
  NemsisStateDataSetParser,
};
