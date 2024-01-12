const _ = require('lodash');
const { Base } = require('./base');

const crypto = require('../lib/crypto');

module.exports = (sequelize, DataTypes) => {
  class Export extends Base {
    static associate(models) {
      Export.belongsTo(models.Agency, { as: 'agency' });
      Export.belongsTo(models.State, { as: 'state' });
      Export.belongsTo(models.User, { as: 'createdBy' });
      Export.belongsTo(models.User, { as: 'updatedBy' });
    }

    toJSON() {
      const attributes = { ...this.get() };
      return _.pick(attributes, [
        'id',
        'name',
        'description',
        'logo',
        'logoUrl',
        'type',
        'authUrl',
        'apiUrl',
        'username',
        'organization',
        'isVisible',
        'isApprovalReqd',
        'isOverridable',
        'createdById',
        'updatedById',
        'createdAt',
        'updatedAt',
      ]);
    }
  }

  Export.init(
    {
      name: DataTypes.TEXT,
      description: DataTypes.TEXT,
      logo: DataTypes.TEXT,
      logoUrl: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.assetUrl('logo');
        },
      },
      type: DataTypes.TEXT,
      authUrl: DataTypes.TEXT,
      apiUrl: DataTypes.TEXT,
      username: DataTypes.TEXT,
      password: {
        type: DataTypes.VIRTUAL,
        get() {
          return crypto.decrypt(process.env.MODEL_EXPORT_AES_KEY, this.getDataValue('encryptedPassword'));
        },
        set(newValue) {
          let encrypted = null;
          if (newValue) {
            encrypted = crypto.encrypt(process.env.MODEL_EXPORT_AES_KEY, newValue);
          }
          this.setDataValue('encryptedPassword', encrypted);
        },
      },
      encryptedPassword: DataTypes.TEXT,
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
