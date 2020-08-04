'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

function importModelsFromDir(dirname) {
  fs.readdirSync(dirname)
    .filter(file => {
      return (file.indexOf('.') !== 0) && 
        (file !== basename) &&
        (file !== 'nemsis-model.js') &&
        (file.slice(-3) === '.js');
    })
    .forEach(file => {
      const model = sequelize['import'](path.join(dirname, file));
      db[model.name] = model;
    });
}

/// import models from current dir
importModelsFromDir(__dirname);
/// import models from any immediate subdirs
fs.readdirSync(__dirname)
  .filter(dir => {
    return (dir.indexOf('.') !== 0) && (dir.slice(-3) !== '.js');
  })
  .forEach(dir => {
    importModelsFromDir(path.join(__dirname, dir))
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

/// refactor some common model helper functions here
db.helpers = {
  data: {    
    setOrAddValue(data, path, newValue) {
      let value = _.get(data, path);
      if (Array.isArray(value)) {
        if (_.find(value, {_text: newValue})) return;
        value.push({_text: newValue});
      } else if (value) {
        if (value._text === newValue) return;
        value = [value];
        value.push({_text: newValue});
      } else {
        _.set(data, path, {_text: newValue});
      }
    },
    setValue(data, path, newValue) {
      data = data || {};
      _.set(data, path, {_text: newValue});
      return data;
    },
    firstValueOf(element) {
      return Array.isArray(element) ? element[0]?._text : element?._text;
    },
    geometryFor(latlng) {
      let value = null;
      if (latlng) {
        const [lat, lng] = latlng.split(',');
        if (lat && lng) {
          value = {type: 'Point', coordinates:[parseFloat(lng), parseFloat(lat)]};
        }
      }
      return value;
    }
  }
};

module.exports = db;
