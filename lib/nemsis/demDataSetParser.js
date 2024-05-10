const expat = require('node-expat');
const fs = require('fs');
const _ = require('lodash');

class NemsisDemDataSetParser {
  constructor(filePath) {
    this.filePath = filePath;
  }

  parse(configure) {
    return new Promise((resolve, reject) => {
      const stream = fs.createReadStream(this.filePath, { encoding: 'utf8' });
      const parser = new expat.Parser('UTF-8');
      const stack = [];

      configure(
        stream,
        parser,
        stack,
        (result) => {
          stream.destroy();
          resolve(result);
        },
        (error) => {
          stream.destroy();
          reject(error);
        },
      );

      parser.on('text', (text) => {
        if (stack.length > 0) {
          const trimmed = text.trim();
          if (trimmed !== '') {
            stack[stack.length - 1]._text = `${stack[stack.length - 1]._text ?? ''}${text}`;
          }
        }
      });

      parser.on('error', (error) => {
        stream.destroy();
        reject(error);
      });

      stream.pipe(parser);
    });
  }

  getNemsisVersion() {
    return this.parse((stream, parser, stack, resolve, reject) => {
      parser.on('startElement', (name, attr) => {
        if (name === 'DEMDataSet') {
          const m = attr?.['xsi:schemaLocation']?.match(/https?:\/\/(?:www\.)?nemsis\.org\/media\/nemsis_v3\/([^/]+)\//);
          if (m) {
            resolve(m[1]);
          } else {
            reject();
          }
        }
      });
    });
  }

  parseElement(rootTag, groupTag, callback, customStart, customEnd) {
    return this.parse((stream, parser, stack, resolve, reject) => {
      let dataSetNemsisVersion;
      const other = {};

      parser.on('startElement', (name, attr) => {
        if (customStart?.(stack, name, attr, other)) {
          // noop
        } else if (name.startsWith(`${rootTag}.`) || (!groupTag && name === rootTag)) {
          const element = {};
          if (!_.isEmpty(attr)) {
            element._attributes = attr;
          }
          if (name !== (groupTag ?? rootTag)) {
            const idx = stack.length - 1;
            if (stack[idx][name]) {
              if (!Array.isArray(stack[idx][name])) {
                stack[idx][name] = [stack[idx][name]];
              }
              stack[idx][name].push(element);
            } else {
              stack[idx][name] = element;
            }
          }
          stack.push(element);
        } else if (name === 'DEMDataSet') {
          const m = attr?.['xsi:schemaLocation']?.match(/https?:\/\/(?:www.)?nemsis.org\/media\/nemsis_v3\/([^/]+)\//);
          dataSetNemsisVersion = m?.[1];
        }
      });

      parser.on('endElement', (name) => {
        if (customEnd?.(stack, name, other)) {
          // noop
        } else if (name === (groupTag ?? rootTag)) {
          stream.pause();
          parser.pause();
          Promise.resolve(callback(dataSetNemsisVersion, stack.pop(), other))
            .then(() => {
              if (groupTag) {
                stream.resume();
                parser.resume();
              } else {
                resolve();
              }
            })
            .catch((error) => reject(error));
        } else if (name.startsWith(`${rootTag}.`)) {
          const element = stack.pop();
          if (stack.length === 0) {
            other[name] = element;
          }
        } else if (name === rootTag || name === 'DEMDataSet') {
          resolve();
        }
      });
    });
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
