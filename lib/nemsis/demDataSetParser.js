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

  parseAgency(callback) {
    return this.parse((stream, parser, stack, resolve, reject) => {
      let dataSetNemsisVersion;

      parser.on('startElement', (name, attr) => {
        if (name === 'dAgency') {
          stack.push({});
        } else if (name.startsWith('dAgency.')) {
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
        } else if (name === 'DEMDataSet') {
          const m = attr?.['xsi:schemaLocation']?.match(/https?:\/\/(?:www\.)?nemsis\.org\/media\/nemsis_v3\/([^/]+)\//);
          dataSetNemsisVersion = m?.[1];
        }
      });

      parser.on('endElement', (name) => {
        if (name === 'dAgency') {
          stream.pause();
          parser.pause();
          Promise.resolve(callback(dataSetNemsisVersion, stack.pop()))
            .then((isCancelled) => {
              if (isCancelled) {
                resolve();
              } else {
                stream.resume();
                parser.resume();
              }
            })
            .catch((error) => reject(error));
        } else if (name.startsWith('dAgency.')) {
          stack.pop();
        } else if (name === 'dAgency' || name === 'DEMDataSet') {
          resolve();
        }
      });
    });
  }
}

module.exports = {
  NemsisDemDataSetParser,
};
