const path = require('path');

const rootPath = path.resolve(__dirname, '..');

function root(...args) {
  return path.join(...[rootPath, ...args]);
}

exports.root = root;
