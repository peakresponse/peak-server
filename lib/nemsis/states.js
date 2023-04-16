const fs = require('fs');
const inflection = require('inflection');
const path = require('path');
const shelljs = require('shelljs');

const States = require('../states');

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

  get dataSetVersionsInstalled() {
    const files = fs.readdirSync(path.resolve(__dirname, `../../${this.basePath}`));
    return this.dataSetVersions.filter((v) => files.includes(v));
  }

  get schematronVersions() {
    const { stdout } = shelljs.exec(`cd ${this.basePath}/master; git --no-pager log --format="%as-%H" Schematron/*_EMSDataSet.sch`, {
      silent: true,
    });
    return stdout.trim().split('\n');
  }

  get schematronVersionsInstalled() {
    const files = fs.readdirSync(path.resolve(__dirname, `../../${this.basePath}`));
    return this.schematronVersions.filter((v) => files.includes(v));
  }

  toJSON() {
    const { exists } = this;
    return {
      initialized: exists,
      dataSetVersions: exists ? this.dataSetVersions : [],
      schematronVersions: exists ? this.schematronVersions : [],
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
      version,
      path.resolve(__dirname, `../../${this.basePath}/${version}/Resources/${this.state.abbr}_StateDataSet.xml`)
    );
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
