module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('nemsis_state_data_sets', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        type: Sequelize.UUID,
      },
      state_id: {
        allowNull: false,
        type: Sequelize.STRING,
        references: {
          model: {
            tableName: 'states',
          },
          key: 'id',
        },
      },
      nemsis_version: {
        type: Sequelize.STRING,
      },
      version: {
        type: Sequelize.STRING,
      },
      file: {
        type: Sequelize.STRING,
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
      created_by_agency_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'agencies',
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
    // create a partial unique index that enforces unique version when set
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX nemsis_state_data_sets_version_uk ON nemsis_state_data_sets (state_id, version) WHERE version IS NOT NULL'
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('nemsis_state_data_sets');
  },
};
