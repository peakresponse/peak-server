const fs = require('fs');
const inflection = require('inflection');
const path = require('path');
const shelljs = require('shelljs');

const States = require('../states');

const { NemsisSchematronParser } = require('./schematronParser');
const { NemsisStateDataSetParser } = require('./stateDataSetParser');

class NemsisStateRepo {
  constructor(state, baseNemsisVersion) {
    this.state = state;
    this.baseNemsisVersion = baseNemsisVersion;
    this.repoName = inflection.dasherize(state.name).toLowerCase();
  }

  get basePath() {
    return `nemsis/repositories/${this.repoName}/${this.baseNemsisVersion}`;
  }

  get exists() {
    return fs.existsSync(path.resolve(__dirname, `../../${this.basePath}/master`));
  }

  get dataSetVersions() {
    const { stdout } = shelljs.exec(`cd ${this.basePath}/master; git --no-pager log --format="%as-%H" Resources/*_StateDataSet.xml`, {
      silent: true,
    });
    return stdout.trim().split('\n');
  }

  get demSchematronVersions() {
    const { stdout } = shelljs.exec(
      `cd ${this.basePath}/master; git --no-pager log --format="%as-%H" Schematron/${this.state.abbr}_DEMDataSet.sch`,
      {
        silent: true,
      }
    );
    return stdout.trim().split('\n').filter(Boolean);
  }

  get emsSchematronVersions() {
    const { stdout } = shelljs.exec(
      `cd ${this.basePath}/master; git --no-pager log --format="%as-%H" Schematron/${this.state.abbr}_EMSDataSet.sch`,
      {
        silent: true,
      }
    );
    return stdout.trim().split('\n').filter(Boolean);
  }

  toJSON() {
    const { exists } = this;
    return {
      initialized: exists,
      dataSetVersions: exists ? this.dataSetVersions : [],
      demSchematronVersions: exists ? this.demSchematronVersions : [],
      emsSchematronVersions: exists ? this.emsSchematronVersions : [],
    };
  }

  install(version) {
    return new Promise((resolve) => {
      shelljs.exec(
        `bin/pull-nemsis-state ${this.baseNemsisVersion} ${this.repoName} ${version}`,
        { silent: true },
        (code, stdout, stderr) => resolve({ code, stdout, stderr })
      );
    });
  }

  pull() {
    return new Promise((resolve) => {
      shelljs.exec(`bin/pull-nemsis-state ${this.baseNemsisVersion} ${this.repoName}`, { silent: true }, (code, stdout, stderr) =>
        resolve({ code, stdout, stderr })
      );
    });
  }

  getDataSetParser(version) {
    return new NemsisStateDataSetParser(
      path.resolve(__dirname, `../../${this.basePath}/${version}/Resources/${this.state.abbr}_StateDataSet.xml`),
      version
    );
  }

  getDEMSchematronPath(version) {
    return path.resolve(__dirname, `../../${this.basePath}/${version}/Schematron/${this.state.abbr}_DEMDataSet.sch`);
  }

  getDEMSchematronParser(version) {
    return new NemsisSchematronParser(this.getDEMSchematronPath(version), version);
  }

  getEMSSchematronPath(version) {
    return path.resolve(__dirname, `../../${this.basePath}/${version}/Schematron/${this.state.abbr}_EMSDataSet.sch`);
  }

  getEMSSchematronParser(version) {
    return new NemsisSchematronParser(this.getEMSSchematronPath(version), version);
  }

  getSchematronParser(dataSet, version) {
    return dataSet === 'DEMDataSet' ? this.getDEMSchematronParser(version) : this.getEMSSchematronParser(version);
  }
}

function getNemsisStateRepo(stateId, baseNemsisVersion) {
  const state = States.codeMapping[stateId];
  if (state) {
    return new NemsisStateRepo(state, baseNemsisVersion);
  }
  return null;
}

module.exports = {
  getNemsisStateRepo,
  NemsisStateRepo,
};
