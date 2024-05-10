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

  parseElement(rootTag, groupTag, callback) {
    return this.parse((stream, parser, stack, resolve, reject) => {
      let dataSetNemsisVersion;

      parser.on('startElement', (name, attr) => {
        if (name.startsWith(`${rootTag}.`) || (!groupTag && name === rootTag)) {
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
        if (name === (groupTag ?? rootTag)) {
          stream.pause();
          parser.pause();
          Promise.resolve(callback(dataSetNemsisVersion, stack.pop()))
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
          stack.pop();
        } else if (name === rootTag || name === 'DEMDataSet') {
          resolve();
        }
      });
    });
  }

  parseAgency(callback) {
    return this.parseElement('dAgency', null, callback);
  }

  parseConfiguration(callback) {
    return this.parseElement('dConfiguration', 'dConfiguration.ConfigurationGroup', callback);
  }
}

module.exports = {
  NemsisDemDataSetParser,
};
