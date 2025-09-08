const bcrypt = require('bcrypt');
const randomString = require('randomstring');
const { Model } = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');

module.exports = (sequelize, DataTypes) => {
  class Client extends Model {
    static associate(models) {
      Client.belongsTo(models.User, { as: 'user' });
      Client.belongsTo(models.User, { as: 'createdBy' });
      Client.belongsTo(models.User, { as: 'updatedBy' });
    }

    authenticate(clientSecret) {
      return bcrypt.compareSync(clientSecret, this.hashedClientSecret);
    }

    generateClientIdAndSecret() {
      const clientId = randomString.generate({ length: 20, readable: true });
      const clientSecret = randomString.generate({ length: 40 });
      this.clientId = clientId;
      this.hashedClientSecret = bcrypt.hashSync(clientSecret, 12);
      return { clientId, clientSecret };
    }

    toJSON() {
      const attributes = { ...this.get() };
      delete attributes.hashedClientSecret;
      delete attributes.redirectUris;
      return attributes;
    }
  }
  Client.init(
    {
      name: DataTypes.STRING,
      clientId: DataTypes.STRING,
      hashedClientSecret: DataTypes.TEXT,
      redirectUri: DataTypes.TEXT,
      redirectUris: {
        type: DataTypes.VIRTUAL,
        get() {
          const uris = [];
          if (this.redirectUri) {
            uris.push(this.redirectUri);
          }
          return uris;
        },
      },
      grants: {
        type: DataTypes.VIRTUAL,
        get() {
          const grants = ['refresh_token'];
          if (this.redirectUri) {
            grants.push('authorization_code');
          }
          if (this.userId) {
            grants.push('client_credentials');
          }
          return grants;
        },
      },
    },
    {
      sequelize,
      modelName: 'Client',
      tableName: 'clients',
      underscored: true,
    },
  );
  sequelizePaginate.paginate(Client);
  return Client;
};
