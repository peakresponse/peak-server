const expat = require('node-expat');
const fs = require('fs');
const inflection = require('inflection');
const path = require('path');
const shelljs = require('shelljs');

const States = require('../states');

class NemsisStateRepo {
  constructor(state, nemsisVersion) {
    this.state = state;
    this.nemsisVersion = nemsisVersion;
    this.repoName = inflection.dasherize(state.name).toLowerCase();
  }

  get exists() {
    return fs.existsSync(path.resolve(__dirname, `../../nemsis/repositories/${this.repoName}/${this.nemsisVersion}/master`));
  }

  get dataSetVersions() {
    const {
      stdout,
    } = shelljs.exec(
      `cd nemsis/repositories/${this.repoName}/${this.nemsisVersion}/master; git --no-pager log --format="%as-%H" Resources/*_StateDataSet.xml`,
      { silent: true }
    );
    return stdout.trim().split('\n');
  }

  get dataSetVersionsInstalled() {
    const files = fs.readdirSync(path.resolve(__dirname, `../../nemsis/repositories/${this.repoName}/${this.nemsisVersion}`));
    return this.dataSetVersions.filter((v) => files.includes(v));
  }

  get schematronVersions() {
    const {
      stdout,
    } = shelljs.exec(
      `cd nemsis/repositories/${this.repoName}/${this.nemsisVersion}/master; git --no-pager log --format="%as-%H" Schematron/*_EMSDataSet.sch`,
      { silent: true }
    );
    return stdout.trim().split('\n');
  }

  get schematronVersionsInstalled() {
    const files = fs.readdirSync(path.resolve(__dirname, `../../nemsis/repositories/${this.repoName}/${this.nemsisVersion}`));
    return this.schematronVersions.filter((v) => files.includes(v));
  }

  toJSON() {
    const { exists } = this;
    return {
      initialized: exists,
      dataSetVersionsInstalled: exists ? this.dataSetVersionsInstalled : [],
      schematronVersionsInstalled: exists ? this.schematronVersionsInstalled : [],
    };
  }

  pull() {
    return new Promise((resolve) => {
      shelljs.exec(`bin/pull-nemsis-state ${this.nemsisVersion} ${this.repoName}`, { silent: true }, (code, stdout, stderr) =>
        resolve({ code, stdout, stderr })
      );
    });
  }

  parseDataSet(version, configure) {
    return new Promise((resolve, reject) => {
      const filePath = path.resolve(
        __dirname,
        `../../nemsis/repositories/${this.repoName}/${this.nemsisVersion}/${version}/Resources/${this.state.abbr}_StateDataSet.xml`
      );
      const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
      const parser = new expat.Parser('UTF-8');
      const stack = [];

      configure(stream, parser, stack);

      parser.on('text', (text) => {
        if (stack.length > 0) {
          const trimmed = text.trim();
          if (trimmed !== '') {
            stack[stack.length - 1]._text = `${stack[stack.length - 1]._text ?? ''}${text}`;
          }
        }
      });

      parser.on('error', (error) => {
        reject(error);
      });

      stream.on('close', () => resolve());
      stream.pipe(parser);
    });
  }

  parseAgencies(version, callback) {
    return this.parseDataSet(version, (stream, parser, stack) => {
      parser.on('startElement', (name) => {
        if (name === 'sAgencyGroup') {
          stack.push({});
        } else if (name.startsWith('sAgency.')) {
          stack[0][name] = {};
          stack.push(stack[0][name]);
        }
      });

      parser.on('endElement', (name) => {
        if (name === 'sAgencyGroup') {
          parser.pause();
          Promise.resolve(callback(stack.pop())).then(() => parser.resume());
        } else if (name.startsWith('sAgency.')) {
          stack.pop();
        } else if (name === 'sAgency') {
          stream.destroy();
        }
      });
    });
  }

  parseFacilities(version, callback) {
    return this.parseDataSet(version, (stream, parser, stack) => {
      let facilityType;

      parser.on('startElement', (name) => {
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
        }
      });

      parser.on('endElement', (name) => {
        if (name === 'sFacility.FacilityGroup') {
          parser.pause();
          Promise.resolve(callback(facilityType._text, stack.pop())).then(() => parser.resume());
        } else if (name.startsWith('sFacility.')) {
          stack.pop();
        } else if (name === 'sFacility') {
          stream.destroy();
        }
      });
    });
  }
}

function getNemsisStateRepo(stateId, nemsisVersion) {
  const state = States.codeMapping[stateId];
  if (state) {
    return new NemsisStateRepo(state, nemsisVersion);
  }
  return null;
}

module.exports = {
  getNemsisStateRepo,
  NemsisStateRepo,
};
