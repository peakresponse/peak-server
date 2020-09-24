/* eslint-disable import/no-dynamic-require, global-require */
const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const basename = path.basename(__filename);
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
    );
  })
  .forEach((file) => {
    router.use(
      `/${path.basename(file, '.js')}`,
      require(path.resolve(__dirname, file))
    );
  });

module.exports = router;
