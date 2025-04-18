const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SectionElement extends Model {
    static associate(models) {
      SectionElement.belongsTo(models.Section, { as: 'section' });
      SectionElement.belongsTo(models.NemsisElement, { as: 'nemsisElement' });
      SectionElement.belongsTo(models.Screen, { as: 'screen' });
      SectionElement.belongsTo(models.User, { as: 'createdBy' });
      SectionElement.belongsTo(models.User, { as: 'updatedBy' });
    }
  }
  SectionElement.init(
    {
      position: DataTypes.INTEGER,
      column: DataTypes.INTEGER,
      customId: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'SectionElement',
      tableName: 'section_elements',
      underscored: true,
    },
  );
  return SectionElement;
};
