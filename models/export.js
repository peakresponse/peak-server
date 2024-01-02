const crypto = require('node:crypto');
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
      password: {
        type: DataTypes.VIRTUAL,
        get() {
          const [iv, encrypted] = this.getDataValue('encryptedPassword')?.split(':') ?? [];
          if (iv && encrypted) {
            const decipher = crypto.createDecipheriv(
              'aes-256-cbc',
              Buffer.from(process.env.MODEL_EXPORT_AES_KEY, 'base64'),
              Buffer.from(iv, 'base64'),
            );
            let plaintext = decipher.update(encrypted, 'base64', 'utf8');
            plaintext += decipher.final('utf8');
            return plaintext;
          }
          return null;
        },
        set(newValue) {
          const iv = crypto.randomBytes(16);
          const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(process.env.MODEL_EXPORT_AES_KEY, 'base64'), iv);
          let encrypted = cipher.update(newValue, 'utf8', 'base64');
          encrypted += cipher.final('base64');
          this.setDataValue('encryptedPassword', `${iv.toString('base64')}:${encrypted}`);
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
