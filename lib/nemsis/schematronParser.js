const expat = require('node-expat');
const fs = require('fs');

class NemsisSchematronParser {
  constructor(filePath, version) {
    this.filePath = filePath;
    this.version = version;
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

  getDataSet() {
    return this.parse((stream, parser, stack, resolve) => {
      parser.on('startElement', (name, attr) => {
        if (name === 'sch:schema') {
          resolve(attr?.id);
        }
      });
    });
  }

  getNemsisVersion() {
    return this.parse((stream, parser, stack, resolve, reject) => {
      parser.on('startElement', (name, attr) => {
        if (name === 'sch:schema') {
          const m = attr?.schemaVersion?.match(/([^_]+)(:?_(.+))?/);
          if (m) {
            resolve(m[1]);
          } else {
            reject();
          }
        }
      });
    });
  }

  getFileVersion() {
    return this.parse((stream, parser, stack, resolve, reject) => {
      parser.on('startElement', (name, attr) => {
        if (name === 'sch:schema') {
          const m = attr?.schemaVersion?.match(/([^_]+)(?:_(.+))?/);
          if (m) {
            resolve(m.length > 2 ? m[2] : undefined);
          } else {
            reject();
          }
        }
      });
    });
  }
}

module.exports = {
  NemsisSchematronParser,
};
