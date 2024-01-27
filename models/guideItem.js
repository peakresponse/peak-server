const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class GuideItem extends Base {
    static associate(models) {
      GuideItem.belongsTo(models.User, { as: 'createdBy' });
      GuideItem.belongsTo(models.User, { as: 'updatedBy' });
      GuideItem.belongsTo(models.GuideSection, { as: 'section' });
    }
  }

  GuideItem.init(
    {
      file: DataTypes.TEXT,
      fileUrl: {
        type: DataTypes.VIRTUAL(DataTypes.TEXT, ['file']),
        get() {
          return this.assetUrl('file');
        },
      },
      body: DataTypes.TEXT,
      position: DataTypes.INTEGER,
      isVisible: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'GuideItem',
      tableName: 'guide_items',
      underscored: true,
    },
  );

  GuideItem.afterSave(async (record, options) => {
    await record.handleAssetFile('file', options);
  });

  return GuideItem;
};
