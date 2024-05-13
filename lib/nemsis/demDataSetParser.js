const _ = require('lodash');

const { NEMSIS_VERSION_REGEXP, XmlParser } = require('./xmlParser');

class NemsisDemDataSetParser extends XmlParser {
  getNemsisVersion() {
    return this.parse((stream, parser, stack, resolve, reject) => {
      parser.on('startElement', (name, attr) => {
        if (name === 'DEMDataSet') {
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

  onStartElement(name, attr) {
    if (name === 'DEMDataSet') {
      const m = attr?.['xsi:schemaLocation']?.match(NEMSIS_VERSION_REGEXP);
      this.other.dataSetNemsisVersion = m?.[1];
    } else {
      super.onStartElement(name, attr);
    }
  }

  onEndElement(name) {
    if (name === 'DEMDataSet') {
      this.resolve();
    } else {
      super.onEndElement(name);
    }
  }

  parseAgency(callback) {
    return this.parseElement('dAgency', null, callback);
  }

  parseConfigurations(callback) {
    return this.parseElement('dConfiguration', 'dConfiguration.ConfigurationGroup', callback);
  }

  parseContacts(callback) {
    return this.parseElement('dContact', 'dContact.ContactInfoGroup', callback);
  }

  parseCustomConfigurations(callback) {
    return this.parseElement('dCustomConfiguration', 'dCustomConfiguration.CustomGroup', callback);
  }

  parseCustomResults(callback) {
    return this.parseElement('dCustomResults', 'dCustomResults.ResultsGroup', callback);
  }

  parseDevices(callback) {
    return this.parseElement('dDevice', 'dDevice.DeviceGroup', callback);
  }

  parseFacilities(callback) {
    return this.parseElement(
      'dFacility',
      'dFacility.FacilityGroup',
      callback,
      (stack, name, attr) => {
        if (name === 'dFacility.01') {
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
        if (name === 'dFacility.01') {
          other[name] = stack.pop();
          return true;
        }
        if (name === 'dFacilityGroup') {
          delete other['dFacility.01'];
          return true;
        }
        return false;
      },
    );
  }

  parseLocations(callback) {
    return this.parseElement('dLocation', 'dLocation.LocationGroup', callback);
  }

  parsePersonnel(callback) {
    return this.parseElement('dPersonnel', 'dPersonnel.PersonnelGroup', callback);
  }

  parseVehicles(callback) {
    return this.parseElement('dVehicle', 'dVehicle.VehicleGroup', callback);
  }
}

module.exports = {
  NemsisDemDataSetParser,
};
