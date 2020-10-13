/* eslint-disable import/no-dynamic-require, global-require */

const fs = require('fs');
const path = require('path');

const basename = path.basename(__filename);

const states = {};

fs.readdirSync(__dirname)
  .filter((file) => {
    return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js';
  })
  .forEach((file) => {
    states[path.basename(file, '.js')] = require(path.resolve(__dirname, file));
  });

module.exports = states;
