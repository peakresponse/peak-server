module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('versions', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        type: Sequelize.UUID,
      },
      agency_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'agencies',
          },
          key: 'id',
        },
      },
      nemsis_version: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      state_data_set_version: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      state_schematron_version: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      dem_custom_configuration: {
        type: Sequelize.JSONB,
      },
      ems_custom_configuration: {
        type: Sequelize.JSONB,
      },
      dem_data_set: {
        type: Sequelize.JSONB,
      },
      is_valid: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      validation_errors: {
        type: Sequelize.JSONB,
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
    await queryInterface.addColumn('agencies', 'version_id', {
      type: Sequelize.UUID,
      references: {
        model: {
          tableName: 'versions',
        },
        key: 'id',
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('agencies', 'version_id');
    await queryInterface.dropTable('versions');
  },
};
