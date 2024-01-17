const _ = require('lodash');
const { Model } = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');

module.exports = (sequelize, DataTypes) => {
  class ExportLog extends Model {
    static associate(models) {
      ExportLog.belongsTo(models.Export, { as: 'export' });
      ExportLog.belongsTo(models.ExportTrigger, { as: 'exportTrigger' });
      ExportLog.belongsTo(models.Report, { as: 'report' });
    }

    toJSON() {
      const attributes = { ...this.get() };
      const data = _.pick(attributes, ['id', 'exportId', 'exportTriggerId', 'reportId', 'params', 'result', 'createdAt', 'updatedAt']);
      return data;
    }
  }
  ExportLog.init(
    {
      params: DataTypes.JSONB,
      result: DataTypes.JSONB,
    },
    {
      sequelize,
      modelName: 'ExportLog',
      tableName: 'export_logs',
      underscored: true,
    },
  );
  sequelizePaginate.paginate(ExportLog);
  return ExportLog;
};
