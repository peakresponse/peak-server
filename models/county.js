const { Model, Op } = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
const _ = require('lodash');

const cache = {
  nameMapping: {},
  codeMapping: {},
};

function findByName(counties, name) {
  return _.find(counties, (c) => name.localeCompare(c.name, undefined, { sensitivity: 'accent' }) === 0);
}

module.exports = (sequelize, DataTypes) => {
  class County extends Model {
    static async getCode(name, stateCode, options) {
      if (cache.nameMapping[name] !== undefined) {
        return cache.nameMapping[name];
      }
      const counties = await County.findAll({
        where: {
          name: {
            [Op.iLike]: `%${name}%`,
          },
          stateCode,
        },
        transaction: options?.transaction,
      });
      const searchOrder = [name, `${name} County`];
      for (const searchName of searchOrder) {
        const match = findByName(counties, searchName);
        if (match) {
          cache.nameMapping[name] = match.fullCode;
          return match.fullCode;
        }
      }
      cache.nameMapping[name] = null;
      return null;
    }

    static async getName(code, options) {
      if (!code) {
        return null;
      }
      if (cache.codeMapping[code] !== undefined) {
        return cache.codeMapping[code];
      }
      const match = code.match(/(\d{2})(\d{3})/);
      if (match) {
        const [, stateCode, countyCode] = match;
        const county = await County.findOne({
          where: { stateCode, countyCode },
          transaction: options?.transaction,
        });
        if (county) {
          cache.codeMapping[code] = county.name;
          return county.name;
        }
      }
      return null;
    }
  }

  County.init(
    {
      stateAbbr: DataTypes.STRING,
      stateCode: DataTypes.STRING,
      countyCode: DataTypes.STRING,
      fullCode: {
        type: DataTypes.VIRTUAL(DataTypes.STRING, ['stateCode', 'countyCode']),
        get() {
          return `${this.stateCode}${this.countyCode}`;
        },
      },
      name: DataTypes.STRING,
      classCode: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'County',
      tableName: 'counties',
      underscored: true,
    },
  );

  sequelizePaginate.paginate(County);

  return County;
};
