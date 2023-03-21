const fs = require('fs');
const path = require('path');

class NemsisPublicRepo {
  constructor(nemsisVersion) {
    this.nemsisVersion = nemsisVersion;
  }

  // eslint-disable-next-line class-methods-use-this
  get basePath() {
    return 'nemsis/repositories/nemsis_public';
  }

  get exists() {
    return fs.existsSync(path.resolve(__dirname, `../../${this.basePath}/${this.nemsisVersion}`));
  }

  xsdPath(filename) {
    return path.resolve(__dirname, `../../${this.basePath}`, this.nemsisVersion, 'XSDs/NEMSIS_XSDs', filename);
  }
}

function getNemsisPublicRepo(nemsisVersion) {
  return new NemsisPublicRepo(nemsisVersion);
}

module.exports = {
  getNemsisPublicRepo,
  NemsisPublicRepo,
};
