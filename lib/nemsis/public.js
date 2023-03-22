const fs = require('fs-extra');
const path = require('path');
const semver = require('semver');
const shelljs = require('shelljs');

const basePath = 'nemsis/repositories/nemsis_public';

function exists(nemsisVersion) {
  return fs.existsSync(path.resolve(__dirname, '../..', basePath, nemsisVersion ?? 'master'));
}

function versions() {
  const { stdout } = shelljs.exec(`cd ${basePath}/master; git tag -l --sort=-v:refname`, {
    silent: true,
  });
  return stdout
    .trim()
    .split('\n')
    .filter((v) => semver.gte(v.match(/^(\d+\.\d+\.\d+)/)[1], '3.5.0'));
}

function versionsInstalled() {
  const files = fs.readdirSync(path.resolve(__dirname, '../..', basePath));
  return versions().filter((v) => files.includes(v));
}

function pull(nemsisVersion) {
  return new Promise((resolve) => {
    shelljs.exec(`bin/pull-nemsis-public ${nemsisVersion ?? ''}`, { silent: true }, (code, stdout, stderr) =>
      resolve({ code, stdout, stderr })
    );
  });
}

class NemsisPublicRepo {
  constructor(nemsisVersion) {
    this.nemsisVersion = nemsisVersion;
  }

  get baseNemsisVersion() {
    const m = this.nemsisVersion.match(/^(\d+\.\d+\.\d+)/);
    return m[1];
  }

  get exists() {
    return exists(this.nemsisVersion);
  }

  pull() {
    return pull(this.nemsisVersion);
  }

  xsdPath(filename) {
    return path.resolve(__dirname, `../../${basePath}`, this.nemsisVersion, 'XSDs/NEMSIS_XSDs', filename);
  }

  xsdWrapperPath(filename) {
    const wrapperDir = path.resolve(__dirname, `../../${basePath}`, this.nemsisVersion, 'XSDs/NEMSIS_XSDs/wrappers');
    const wrapperPath = path.resolve(wrapperDir, filename);
    if (!fs.existsSync(wrapperPath)) {
      fs.copySync(path.resolve(__dirname, '../../nemsis/xsd/wrappers', this.baseNemsisVersion), wrapperDir);
    }
    return wrapperPath;
  }
}

function getNemsisPublicRepo(nemsisVersion) {
  return new NemsisPublicRepo(nemsisVersion);
}

module.exports = {
  get exists() {
    return exists();
  },
  get versions() {
    return versions();
  },
  get versionsInstalled() {
    return versionsInstalled();
  },
  pull() {
    return pull();
  },
  getNemsisPublicRepo,
  NemsisPublicRepo,
};