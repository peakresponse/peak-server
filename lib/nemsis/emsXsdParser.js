const path = require('path');

const { XmlParser } = require('./xmlParser');

class NemsisEmsXsdParser extends XmlParser {
  getCurrentXsdPath() {
    return `/${this.stack
      .map((s) => {
        let component = s.element;
        if (s.attr.id) {
          component += `[@id='${s.attr.id}']`;
        } else if (s.attr.name) {
          component += `[@name='${s.attr.name}']`;
        }
        return component;
      })
      .join('/')}`;
  }

  getCurrentXmlPath() {
    return (
      this.xmlXPathPrefix +
      this.nodes.map((n) => `${n.name}${n.maxOccurs === null || (Number.isInteger(n.maxOccurs) && n.maxOccurs > 1) ? `[]` : ''}`).join('/')
    );
  }

  onStartElement(element, attr) {
    this.stack.push({ xsd: this.xsd, element, attr });
    if (element === 'xs:include') {
      this.includes.push(attr.schemaLocation);
    } else if (this.nodes.length === 0) {
      // watch for start element
      if (attr.name?.startsWith(this.startingNode.name)) {
        this.nodes.push(this.startingNode);
        this.stack[this.stack.length - 1].node = this.startingNode;
        this.startingNode.xsdPath = this.getCurrentXsdPath();
        this.startingNode.xmlPath = this.getCurrentXmlPath();
      }
    } else if (element === 'xs:element') {
      const minOccurs = parseInt(attr.minOccurs ?? '1', 10);
      const maxOccurs = parseInt(attr.maxOccurs ?? '1', 10);
      const node = {
        xsd: this.xsd,
        name: attr.name,
        minOccurs,
        maxOccurs: Number.isNaN(maxOccurs) ? null : maxOccurs,
        xsdPath: '',
        xmlPath: '',
        children: [],
      };
      if (attr.nillable) {
        node.isNillable = attr.nillable === 'true';
      }
      for (let i = this.nodes.length - 1; i >= 0; i -= 1) {
        if (this.nodes[i].name) {
          this.nodes[i].children?.push(node);
          break;
        }
      }
      this.nodes.push(node);
      this.stack[this.stack.length - 1].node = node;
      node.xsdPath = this.getCurrentXsdPath();
      node.xmlPath = this.getCurrentXmlPath();
    }
  }

  onEndElement(element) {
    const { _text } = this.stack[this.stack.length - 1];
    let node;
    for (let i = this.stack.length - 2; i >= 0; i -= 1) {
      if (this.stack[i].node) {
        ({ node } = this.stack[i]);
        break;
      }
    }
    if ((element === 'definition' || element === 'xs:documentation') && node && _text) {
      node.definition = _text;
    } else if (element === 'name' && node && _text) {
      node.displayName = _text;
    } else if (element === 'national' && node) {
      node.isNational = _text === 'Yes';
    } else if (element === 'state' && node) {
      node.isState = _text === 'Yes';
    } else if (element === 'usage' && node) {
      node.usage = _text;
    }
    if (this.stack[this.stack.length - 1].node) {
      this.nodes.pop();
    }
    this.stack.pop();
    if (this.stack.length === 0) {
      this.resolve();
    }
  }

  async parsePatientCareReport() {
    this.includes = [];
    this.nodes = [];
    this.xsd = path.basename(this.filePath);
    this.result = {
      xsd: this.xsd,
      name: 'PatientCareReport',
      xsdPath: '',
      xmlPath: '',
      children: [],
    };
    this.startingNode = this.result;
    this.xmlXPathPrefix = '/';
    await this.parse((_, parser) => {
      parser.on('startElement', (name, attr) => this.onStartElement(name, attr));
      parser.on('endElement', (name) => this.onEndElement(name));
    });
    this.xmlXPathPrefix = '/PatientCareReport/';
    for (const child of this.result.children) {
      const xsd = this.includes.find((i) => i.startsWith(child.name));
      if (xsd) {
        this.filePath = path.resolve(path.dirname(this.filePath), xsd);
        this.xsd = xsd;
        this.startingNode = child;
        this.startingNode.xsd = xsd;
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
