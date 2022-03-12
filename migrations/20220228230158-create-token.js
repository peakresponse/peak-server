module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tokens', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        type: Sequelize.UUID,
      },
      access_token: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true,
      },
      access_token_expires_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      client_id: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'clients',
          },
          key: 'id',
        },
      },
      refresh_token: {
        type: Sequelize.STRING,
        unique: true,
      },
      refresh_token_expires_at: {
        type: Sequelize.DATE,
      },
      user_id: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'users',
          },
          key: 'id',
        },
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tokens');
  },
};
