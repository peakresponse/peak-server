const shelljs = require('shelljs');

const { NemsisPublicRepo } = require('./public');

async function translateEmsDataSet(sourceVersion, sourcePath, destVersion, destPath) {
  if (sourceVersion.startsWith('3.5.0')) {
    if (destVersion.startsWith('3.4.0')) {
      const repo = new NemsisPublicRepo(sourceVersion);
      const xsltPath = repo.emsTranslationXsltPath(sourceVersion, destVersion);
      return new Promise((resolve, reject) => {
        const cmd = `bin/xslt "${sourcePath}" "${xsltPath}" "${destPath}"`;
        shelljs.exec(cmd, { async: true }, (code, stdout, stderr) => {
          if (code === 0) {
            resolve();
          } else {
            reject(stderr);
          }
        });
      });
    }
  }
  throw new Error('Unsupported translation');
}

module.exports = {
  translateEmsDataSet,
};
