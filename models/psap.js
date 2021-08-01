const { Model } = require('sequelize');
const moment = require('moment');
const path = require('path');
const tmp = require('tmp');

const { download, parseSpreadsheet } = require('../lib/utils');

module.exports = (sequelize, DataTypes) => {
  class Psap extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Psap.belongsTo(models.State, { as: 'state' });
      Psap.belongsTo(models.County, { as: 'county' });
      Psap.belongsTo(models.City, { as: 'city' });
      Psap.belongsToMany(models.User, {
        as: 'users',
        through: models.Dispatcher,
        otherKey: 'userId',
        foreignKey: 'psapId',
      });
    }

    static async importPsapsForState(stateId) {
      const tmpDir = tmp.dirSync();
      try {
        const registryPath = path.resolve(tmpDir.name, 'registry.xlsx');
        await download('https://www.fcc.gov/file/21421/download', registryPath);
        await Psap.parsePsapsForState(stateId, registryPath);
      } finally {
        tmpDir.removeCallback();
      }
    }

    static async parsePsapsForState(stateId, filePath) {
      const stateAbbr = sequelize.models.State.getAbbrForCode(stateId);
      const sheet = await parseSpreadsheet(filePath, { range: 10, raw: false });
      for (const row of sheet.rows) {
        const {
          'PSAP ID': id,
          'PSAP Name': name,
          State: state,
          County: county,
          City: city,
          'Type of Change': change,
          Comments: comments,
          'Date Last Modified ': modified,
        } = row;
        if (id && state?.trim() === stateAbbr) {
          // eslint-disable-next-line no-await-in-loop
          const [psap] = await Psap.findOrBuild({ where: { id } });
          psap.name = name.trim();
          psap.stateId = stateId;
          // eslint-disable-next-line no-await-in-loop
          psap.countyId = await sequelize.models.County.getCode(county?.trim(), stateId);
          // eslint-disable-next-line no-await-in-loop
          psap.cityId = await sequelize.models.City.getCode(city?.trim(), stateId);
          psap.change = change?.trim();
          psap.comments = comments?.trim();
          psap.modifiedOn = moment(modified, 'M/D/YYYY').toISOString();
          // eslint-disable-next-line no-await-in-loop
          await psap.save();
        }
      }
    }
  }

  Psap.init(
    {
      name: DataTypes.STRING,
      change: DataTypes.STRING,
      comments: DataTypes.TEXT,
      modifiedOn: {
        type: DataTypes.DATEONLY,
        field: 'modified_on',
      },
    },
    {
      sequelize,
      modelName: 'Psap',
      tableName: 'psaps',
      underscored: true,
    }
  );
  return Psap;
};
