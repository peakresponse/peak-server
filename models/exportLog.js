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
      const data = _.pick(attributes, [
        'id',
        'exportId',
        'exportTriggerId',
        'reportId',
        'params',
        'result',
        'isError',
        'createdAt',
        'updatedAt',
      ]);
      if (this.export) {
        data.export = this.export.toJSON();
      }
      if (this.exportTrigger) {
        data.exportTrigger = this.exportTrigger.toJSON();
      }
      return data;
    }
  }
  ExportLog.init(
    {
      params: DataTypes.JSONB,
      result: DataTypes.JSONB,
      isError: DataTypes.BOOLEAN,
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
