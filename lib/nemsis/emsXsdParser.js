const path = require('path');

const { XmlParser } = require('./xmlParser');

class NemsisEmsXsdParser extends XmlParser {
  onStartElement(name, attr) {
    if (name === 'xs:include') {
      this.includes.push(attr.schemaLocation);
    }
    if (this.stack.length === 0) {
      // watch for start element
      if (attr.name.startsWith(this.startElement.name)) {
        this.stack.push(this.startElement);
      }
    } else if (name === 'xs:element') {
      const minOccurs = parseInt(attr.minOccurs ?? '1', 10);
      const maxOccurs = parseInt(attr.maxOccurs ?? '1', 10);
      const node = {
        name: attr.name,
        xsd: this.xsd,
        minOccurs,
        maxOccurs: Number.isNaN(maxOccurs) ? null : maxOccurs,
        children: [],
      };
      if (attr.nillable) {
        node.isNillable = attr.nillable === 'true';
      }
      for (let i = this.stack.length - 1; i >= 0; i -= 1) {
        if (this.stack[i].name) {
          this.stack[i].children.push(node);
          break;
        }
      }
      this.stack.push(node);
    } else {
      this.stack.push({ attr });
    }
  }

  onEndElement(name) {
    if (this.stack.length > 0) {
      const { _text } = this.stack[this.stack.length - 1];
      let element;
      for (let i = this.stack.length - 2; i >= 0; i -= 1) {
        if (this.stack[i].name) {
          element = this.stack[i];
          break;
        }
      }
      if ((name === 'definition' || name === 'xs:documentation') && element && _text) {
        element.definition = _text;
      } else if (name === 'name' && element && _text) {
        element.displayName = _text;
      } else if (name === 'national' && element) {
        element.isNational = _text === 'Yes';
      } else if (name === 'state' && element) {
        element.isState = _text === 'Yes';
      } else if (name === 'usage' && element) {
        element.usage = _text;
      }
      delete this.stack[this.stack.length - 1]._text;
      this.stack.pop();
      if (this.stack.length === 0) {
        this.resolve();
      }
    }
  }

  async parsePatientCareReport() {
    this.includes = [];
    this.xsd = path.basename(this.filePath);
    this.result = { xsd: this.xsd, name: 'PatientCareReport', children: [] };
    this.startElement = this.result;
    await this.parse((_, parser) => {
      parser.on('startElement', (name, attr) => this.onStartElement(name, attr));
      parser.on('endElement', (name) => this.onEndElement(name));
    });
    for (const child of this.result.children) {
      const xsd = this.includes.find((i) => i.startsWith(child.name));
      if (xsd) {
        this.filePath = path.resolve(path.dirname(this.filePath), xsd);
        this.xsd = xsd;
        this.startElement = child;
        this.startElement.xsd = xsd;
        // eslint-disable-next-line no-await-in-loop
        await this.parse((_, parser) => {
          parser.on('startElement', (name, attr) => this.onStartElement(name, attr));
          parser.on('endElement', (name) => this.onEndElement(name));
        });
      }
    }
    return this.result;
  }
}

module.exports = {
  NemsisEmsXsdParser,
};
