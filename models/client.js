const bcrypt = require('bcrypt');
const randomString = require('randomstring');
const { Model } = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');

module.exports = (sequelize, DataTypes) => {
  class Client extends Model {
    static associate(models) {
      Client.belongsTo(models.User, { as: 'createdBy' });
      Client.belongsTo(models.User, { as: 'updatedBy' });
    }

    authenticate(clientSecret) {
      return bcrypt.compare(clientSecret, this.hashedClientSecret);
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
      return attributes;
    }
  }
  Client.init(
    {
      name: {
        type: DataTypes.STRING,
      },
      clientId: {
        type: DataTypes.STRING,
        field: 'client_id',
      },
      hashedClientSecret: {
        type: DataTypes.TEXT,
        field: 'hashed_client_secret',
      },
      redirectUri: {
        type: DataTypes.TEXT,
        field: 'redirect_uri',
      },
    },
    {
      sequelize,
      modelName: 'Client',
      tableName: 'clients',
      underscored: true,
    }
  );
  sequelizePaginate.paginate(Client);
  return Client;
};
