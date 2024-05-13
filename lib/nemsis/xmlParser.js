const expat = require('node-expat');
const fs = require('fs');
const _ = require('lodash');

const NEMSIS_VERSION_REGEXP = /https?:\/\/(?:www\.)?nemsis\.org\/media\/nemsis_v3\/([^/]+)\//;

class XmlParser {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async parse(configure) {
    return new Promise((resolve, reject) => {
      this.stream = fs.createReadStream(this.filePath, { encoding: 'utf8' });
      this.parser = new expat.Parser('UTF-8');
      this.stack = [];
      this.other = {};
      this.resolve = resolve;
      this.reject = reject;

      configure(
        this.stream,
        this.parser,
        this.stack,
        (result) => {
          this.stream.destroy();
          resolve(result);
        },
        (error) => {
          this.stream.destroy();
          reject(error);
        },
      );

      this.parser.on('text', (text) => {
        if (this.stack.length > 0) {
          const trimmed = text.trim();
          if (trimmed !== '') {
            this.stack[this.stack.length - 1]._text = `${this.stack[this.stack.length - 1]._text ?? ''}${text}`;
          }
        }
      });

      this.parser.on('error', (error) => {
        this.stream.destroy();
        reject(error);
      });

      this.stream.pipe(this.parser);
    });
  }

  onStartElement(name, attr) {
    if (this.customStart?.(this.stack, name, attr, this.other)) {
      // noop
    } else if (name.startsWith(`${this.rootTag}.`) || (!this.groupTag && name === this.rootTag)) {
      const element = {};
      if (!_.isEmpty(attr)) {
        element._attributes = attr;
      }
      if (name !== (this.groupTag ?? this.rootTag)) {
        const idx = this.stack.length - 1;
        if (this.stack[idx][name]) {
          if (!Array.isArray(this.stack[idx][name])) {
            this.stack[idx][name] = [this.stack[idx][name]];
          }
          this.stack[idx][name].push(element);
        } else {
          this.stack[idx][name] = element;
        }
      }
      this.stack.push(element);
    }
  }

  onEndElement(name) {
    if (this.customEnd?.(this.stack, name, this.other)) {
      // noop
    } else if (name === (this.groupTag ?? this.rootTag)) {
      this.stream.pause();
      this.parser.pause();
      Promise.resolve(this.callback(this.stack.pop(), this.other))
        .then(() => {
          if (this.groupTag) {
            this.stream.resume();
            this.parser.resume();
          } else {
            this.resolve();
          }
        })
        .catch((error) => this.reject(error));
    } else if (name.startsWith(`${this.rootTag}.`)) {
      const element = this.stack.pop();
      if (this.stack.length === 0) {
        this.other[name] = element;
      }
    } else if (name === this.rootTag) {
      this.resolve();
    }
  }

  async parseElement(rootTag, groupTag, callback, customStart, customEnd) {
    this.rootTag = rootTag;
    this.groupTag = groupTag;
    this.callback = callback;
    this.customStart = customStart;
    this.customEnd = customEnd;
    return this.parse((stream, parser) => {
      parser.on('startElement', (name, attr) => this.onStartElement(name, attr));
      parser.on('endElement', (name) => this.onEndElement(name));
    });
  }
}

module.exports = {
  NEMSIS_VERSION_REGEXP,
  XmlParser,
};
