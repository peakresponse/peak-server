const { Model } = require('sequelize');
const { DateTime } = require('luxon');
const path = require('path');
const sequelizePaginate = require('sequelize-paginate');
const tmp = require('tmp-promise');

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
      Psap.hasMany(models.Dispatcher, { as: 'dispatchers', foreignKey: 'psapId' });
      Psap.belongsToMany(models.User, {
        as: 'users',
        through: models.Dispatcher,
        otherKey: 'userId',
        foreignKey: 'psapId',
      });
    }

    static async importPsapsForState(stateId) {
      const tmpDir = await tmp.dir({ unsafeCleanup: true });
      try {
        const registryPath = path.resolve(tmpDir.path, 'registry.xlsx');
        await download('https://www.fcc.gov/sites/default/files/masterpsapregistryv2.272.xlsx', registryPath);
        await Psap.parsePsapsForState(stateId, registryPath);
      } finally {
        await tmpDir.cleanup();
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
          if (modified) {
            psap.modifiedOn = DateTime.fromFormat(modified, 'M/d/yy').toISODate();
          }
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
    },
  );

  sequelizePaginate.paginate(Psap);

  return Psap;
};
