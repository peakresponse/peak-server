const randomString = require('randomstring');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Token extends Model {
    static associate(models) {
      Token.belongsTo(models.Client, { as: 'client' });
      Token.belongsTo(models.User, { as: 'user' });
    }

    generateAccessToken(expiresAt) {
      this.accessToken = randomString.generate({ length: 40, readable: true });
      this.accessTokenExpiresAt = expiresAt;
    }

    generateRefreshToken(expiresAt) {
      this.refreshToken = randomString.generate({ length: 40, readable: true });
      this.refreshTokenExpiresAt = expiresAt;
    }
  }

  Token.init(
    {
      accessToken: {
        type: DataTypes.STRING,
        field: 'access_token',
      },
      accessTokenExpiresAt: {
        type: DataTypes.DATE,
        field: 'access_token_expires_at',
      },
      refreshToken: {
        type: DataTypes.STRING,
        field: 'refresh_token',
      },
      refreshTokenExpiresAt: {
        type: DataTypes.DATE,
        field: 'refresh_token_expires_at',
      },
    },
    {
      sequelize,
      modelName: 'Token',
      tableName: 'tokens',
      underscored: true,
    },
  );
  return Token;
};
