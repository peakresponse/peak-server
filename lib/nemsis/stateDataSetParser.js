const expat = require('node-expat');
const fs = require('fs');
const _ = require('lodash');

class NemsisStateDataSetParser {
  constructor(version, filePath) {
    this.version = version;
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
        }
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
        if (name === 'StateDataSet') {
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

  parseAgencies(callback) {
    return this.parse((stream, parser, stack, resolve, reject) => {
      let state;
      let dataSetNemsisVersion;

      parser.on('startElement', (name, attr) => {
        if (name === 'sAgencyGroup') {
          stack.push({});
        } else if (name.startsWith('sAgency.')) {
          stack[0][name] = {};
          stack.push(stack[0][name]);
        } else if (name === 'sState.01') {
          state = {};
          stack.push(state);
        } else if (name === 'StateDataSet') {
          const m = attr?.['xsi:schemaLocation']?.match(/https?:\/\/(?:www\.)?nemsis\.org\/media\/nemsis_v3\/([^/]+)\//);
          dataSetNemsisVersion = m?.[1];
        }
      });

      parser.on('endElement', (name) => {
        if (name === 'sAgencyGroup') {
          stream.pause();
          parser.pause();
          Promise.resolve(callback(dataSetNemsisVersion, state?._text, stack.pop()))
            .then(() => {
              stream.resume();
              parser.resume();
            })
            .catch((error) => reject(error));
        } else if (name.startsWith('sAgency.')) {
          stack.pop();
        } else if (name === 'sAgency') {
          resolve();
        } else if (name === 'sState.01') {
          stack.pop();
        }
      });
    });
  }

  parseConfiguration(callback) {
    return this.parse((stream, parser, stack, resolve, reject) => {
      let dataSetNemsisVersion;

      parser.on('startElement', (name, attr) => {
        if (name === 'sConfiguration') {
          stack.push({});
        } else if (name.startsWith('sConfiguration.')) {
          const element = {};
          if (!_.isEmpty(attr)) {
            element._attributes = attr;
          }
          const idx = stack.length - 1;
          if (stack[idx][name]) {
            if (!Array.isArray(stack[idx][name])) {
              stack[idx][name] = [stack[idx][name]];
            }
            stack[idx][name].push(element);
          } else {
            stack[idx][name] = element;
          }
          stack.push(element);
        } else if (name === 'StateDataSet') {
          const m = attr?.['xsi:schemaLocation']?.match(/http:\/\/www.nemsis.org\/media\/nemsis_v3\/([^/]+)\//);
          dataSetNemsisVersion = m?.[1];
        }
      });

      parser.on('endElement', (name) => {
        if (name.startsWith('sConfiguration.')) {
          stack.pop();
        } else if (name === 'sConfiguration') {
          stream.pause();
          parser.pause();
          Promise.resolve(callback(dataSetNemsisVersion, stack.pop()))
            .then(() => {
              stream.resume();
              parser.resume();
              resolve();
            })
            .catch((error) => reject(error));
        }
      });
    });
  }

  parseFacilities(callback) {
    return this.parse((stream, parser, stack, resolve, reject) => {
      let state;
      let dataSetNemsisVersion;
      let facilityType;

      parser.on('startElement', (name, attr) => {
        if (name === 'sFacilityGroup') {
          facilityType = {};
        } else if (name === 'sFacility.01') {
          stack.push(facilityType);
        } else if (name === 'sFacility.FacilityGroup') {
          stack.push({});
        } else if (name.startsWith('sFacility.')) {
          const newFacility = {};
          if (stack[0][name]) {
            if (!Array.isArray(stack[0][name])) {
              stack[0][name] = [stack[0][name]];
            }
            stack[0][name].push(newFacility);
          } else {
            stack[0][name] = newFacility;
          }
          stack.push(newFacility);
        } else if (name === 'sState.01') {
          state = {};
          stack.push(state);
        } else if (name === 'StateDataSet') {
          const m = attr?.['xsi:schemaLocation']?.match(/http:\/\/www.nemsis.org\/media\/nemsis_v3\/([^/]+)\//);
          dataSetNemsisVersion = m?.[1];
        }
      });

      parser.on('endElement', (name) => {
        if (name === 'sFacility.FacilityGroup') {
          stream.pause();
          parser.pause();
          Promise.resolve(callback(dataSetNemsisVersion, state?._text, facilityType._text, stack.pop()))
            .then(() => {
              stream.resume();
              parser.resume();
            })
            .catch((error) => {
              reject(error);
            });
        } else if (name.startsWith('sFacility.') || name === 'sState.01') {
          stack.pop();
        } else if (name === 'sFacility') {
          resolve();
        }
      });
    });
  }
}

module.exports = {
  NemsisStateDataSetParser,
};
