module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('psaps', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING,
      },
      state_id: {
        type: Sequelize.STRING,
        references: {
          model: {
            tableName: 'states',
          },
          key: 'id',
        },
      },
      county_id: {
        type: Sequelize.STRING,
        references: {
          model: {
            tableName: 'counties',
          },
          key: 'id',
        },
      },
      city_id: {
        type: Sequelize.STRING,
        references: {
          model: {
            tableName: 'cities',
          },
          key: 'id',
        },
      },
      change: {
        type: Sequelize.STRING,
      },
      comments: {
        type: Sequelize.TEXT,
      },
      modified_on: {
        type: Sequelize.DATEONLY,
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
    await queryInterface.dropTable('psaps');
  },
};
