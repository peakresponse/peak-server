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
