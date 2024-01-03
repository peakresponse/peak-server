const _ = require('lodash');
const { Model } = require('sequelize');

const crypto = require('../lib/crypto');

module.exports = (sequelize, DataTypes) => {
  class ExportTrigger extends Model {
    static associate(models) {
      ExportTrigger.belongsTo(models.Export, { as: 'export' });
      ExportTrigger.belongsTo(models.Agency, { as: 'agency' });
      ExportTrigger.belongsTo(models.User, { as: 'createdBy' });
      ExportTrigger.belongsTo(models.User, { as: 'updatedBy' });
    }

    toJSON() {
      const attributes = { ...this.get() };
      const data = _.pick(attributes, [
        'id',
        'exportId',
        'agencyId',
        'type',
        'debounceTime',
        'isEnabled',
        'approvedById',
        'approvedAt',
        'username',
        'organization',
        'credentials',
        'createdById',
        'updatedById',
        'createdAt',
        'updatedAt',
      ]);
      if (this.agency) {
        data.agency = this.agency.toJSON();
      }
      if (this.export) {
        data.export = this.export.toJSON();
      }
      return data;
    }
  }

  ExportTrigger.init(
    {
      type: DataTypes.TEXT,
      debounceTime: DataTypes.INTEGER,
      isEnabled: DataTypes.BOOLEAN,
      approvedAt: DataTypes.DATE,
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
      credentials: DataTypes.JSONB,
    },
    {
      sequelize,
      modelName: 'ExportTrigger',
      tableName: 'export_triggers',
      underscored: true,
    },
  );

  return ExportTrigger;
};
