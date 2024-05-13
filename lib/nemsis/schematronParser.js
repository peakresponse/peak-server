const { XmlParser } = require('./xmlParser');

class NemsisSchematronParser extends XmlParser {
  constructor(filePath, version) {
    super(filePath);
    this.version = version;
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
