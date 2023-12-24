module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('custom_configurations', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        type: Sequelize.UUID,
      },
      version_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'versions',
          },
          key: 'id',
        },
      },
      is_draft: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      draft_parent_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'custom_configurations',
          },
          key: 'id',
        },
        unique: true,
      },
      custom_element_id: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      data_set: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      data: {
        type: Sequelize.JSONB,
      },
      is_valid: {
        type: Sequelize.BOOLEAN,
      },
      validation_errors: {
        type: Sequelize.JSONB,
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
      archived_at: {
        type: Sequelize.DATE,
      },
    });
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX custom_configurations_custom_element_id_uk ON custom_configurations (created_by_agency_id, custom_element_id) WHERE created_by_agency_id IS NOT NULL AND is_draft=FALSE',
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('custom_configurations');
  },
};
