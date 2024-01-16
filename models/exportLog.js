const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ExportLog extends Model {
    static associate(models) {
      ExportLog.belongsTo(models.Export, { as: 'export' });
      ExportLog.belongsTo(models.ExportTrigger, { as: 'exportTrigger' });
      ExportLog.belongsTo(models.Report, { as: 'report' });
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
  return ExportLog;
};
