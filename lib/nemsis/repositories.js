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
    return fs.existsSync(path.resolve(__dirname, `../../nemsis/repositories/${this.repoName}/${this.nemsisVersion}`));
  }

  toJSON() {
    return {
      initialized: this.exists,
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
