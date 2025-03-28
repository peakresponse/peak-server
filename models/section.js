const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Section extends Model {
    static associate(models) {
      Section.belongsTo(models.Screen, { as: 'screen' });
      Section.belongsTo(models.User, { as: 'createdBy' });
      Section.belongsTo(models.User, { as: 'updatedBy' });
      Section.hasMany(models.SectionElement, { as: 'elements' });
    }
  }
  Section.init(
    {
      name: DataTypes.STRING,
      position: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Section',
      tableName: 'sections',
      underscored: true,
    },
  );
  return Section;
};
