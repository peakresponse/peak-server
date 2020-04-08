'use strict'

const models = require('../../models');
const Op = models.Sequelize.Op;
const _ = require('lodash');


const cache = {
  nameMapping: {},
  codeMapping: {},
};

const findByName = function(counties, name) {
  return _.find(counties, c => name.localeCompare(c.name, undefined, { sensitivity: 'accent' }) === 0);
}

const getCode = async function(name, stateCode) {
  if (cache.nameMapping[name]) {
    return cache.nameMapping[name];
  }
  const counties = await models.County.findAll({
    where: {
      name: {
        [Op.iLike]: `%${name}%`
      },
      stateCode
    }
  });
  /// check for an exact match
  let match = findByName(counties, name);
  if (match) {
    cache.nameMapping[name] = match.fullCode;
    return match.fullCode;
  }
  /// check with County suffix
  match = findByName(counties, `${name} County`);
  if (match) {
    cache.nameMapping[name] = match.fullCode;
    return match.fullCode;
  }
  cache.nameMapping[name] = null;
  return null;
};

const getName = async function(code) {
  if (cache.codeMapping[code]) {
    return cache.codeMapping[code];
  }
  const match = code.match(/(\d{2})(\d{3})/);
  if (match) {
    const [,stateCode, countyCode] = match;
    const county = await models.County.findOne({where: {stateCode, countyCode}});
    if (county) {
      cache.codeMapping[code] = county.name;
      return county.name;
    }
  }
  return null;
};

module.exports = {
  getCode,
  getName,
}
