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
      this.resolve = (result) => {
        this.stream.destroy();
        resolve(result);
      };
      this.reject = (error) => {
        this.stream.destroy();
        reject(error);
      };

      configure(this.stream, this.parser, this.stack, this.resolve, this.reject);

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
    } else if (name === this.groupTag || name.startsWith(`${this.rootTag}.`) || (!this.groupTag && name === this.rootTag)) {
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
      if (this.customResults?.length) {
        for (let resultIdx = this.customResults.length - 1; resultIdx >= 0; resultIdx -= 1) {
          const customResult = this.customResults[resultIdx];
          let found = false;
          if (name === customResult.nemsisElement) {
            if (customResult.correlationId) {
              // search for the correlation id up the stack
              for (let idx = this.stack.length - 1; idx >= 0; idx -= 1) {
                if (this.stack[idx]._attributes?.CorrelationID === customResult.correlationId) {
                  found = true;
                  break;
                }
              }
            } else {
              found = true;
            }
          }
          if (found) {
            this.stack[0].CustomResults = this.stack[0].CustomResults ?? [];
            this.stack[0].CustomResults.push(customResult.data);
            this.customResults.splice(resultIdx, 1);
          }
        }
      }
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
    }
  }

  async parseElement(rootTag, groupTag, callback, customResults, customStart, customEnd) {
    this.rootTag = rootTag;
    this.groupTag = groupTag;
    this.callback = callback;
    this.customResults = customResults;
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
