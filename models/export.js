const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Export extends Model {
    static associate(models) {
      Export.belongsTo(models.Agency, { as: 'agency' });
      Export.belongsTo(models.State, { as: 'state' });
      Export.belongsTo(models.User, { as: 'createdBy' });
      Export.belongsTo(models.User, { as: 'updatedBy' });
    }
  }
  Export.init(
    {
      name: DataTypes.TEXT,
      type: DataTypes.TEXT,
      authUrl: DataTypes.TEXT,
      apiUrl: DataTypes.TEXT,
      username: DataTypes.TEXT,
      password: DataTypes.TEXT,
      organization: DataTypes.TEXT,
      isVisible: DataTypes.BOOLEAN,
      isApprovalReqd: DataTypes.BOOLEAN,
      isOverridable: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'Export',
      tableName: 'exports',
      underscored: true,
    },
  );
  return Export;
};
