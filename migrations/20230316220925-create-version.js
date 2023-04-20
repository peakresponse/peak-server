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
      is_draft: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      nemsis_version: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      state_data_set_id: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'nemsis_state_data_sets',
          },
          key: 'id',
        },
      },
      state_schematron_id: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'nemsis_schematrons',
          },
          key: 'id',
        },
      },
      dem_custom_configuration: {
        type: Sequelize.JSONB,
      },
      ems_custom_configuration: {
        type: Sequelize.JSONB,
      },
      dem_data_set: {
        type: Sequelize.TEXT,
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
    // create a partial unique index that enforces only one draft version per agency
    await queryInterface.sequelize.query('CREATE UNIQUE INDEX versions_agency_id_uk ON versions (agency_id) WHERE is_draft=TRUE');
    await queryInterface.addColumn('agencies', 'version_id', {
      type: Sequelize.UUID,
      references: {
        model: {
          tableName: 'versions',
        },
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_DEFERRED,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('agencies', 'version_id');
    await queryInterface.dropTable('versions');
  },
};
