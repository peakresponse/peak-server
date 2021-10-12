module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('assignments', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        type: Sequelize.UUID,
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
      vehicle_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'vehicles',
          },
          key: 'id',
        },
      },
      ended_at: {
        type: Sequelize.DATE,
      },
      created_by_id: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'users',
          },
          key: 'id',
        },
      },
      updated_by_id: {
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
    await queryInterface.sequelize.query('CREATE UNIQUE INDEX assignments_user_id_uk ON assignments (user_id) WHERE ended_at IS NULL');
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('assignments');
  },
};
