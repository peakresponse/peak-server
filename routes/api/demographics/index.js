/* eslint-disable import/no-dynamic-require, global-require */
const express = require('express');
const inflection = require('inflection');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const basename = path.basename(__filename);
fs.readdirSync(__dirname)
  .filter((file) => file !== 'base.js' && file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js')
  .forEach((file) => {
    router.use(`/${inflection.transform(path.basename(file, '.js'), ['underscore', 'dasherize'])}`, require(path.resolve(__dirname, file)));
  });

module.exports = router;
