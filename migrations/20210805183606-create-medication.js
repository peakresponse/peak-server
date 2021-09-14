module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('medications', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        type: Sequelize.UUID,
      },
      canonical_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'medications',
          },
          key: 'id',
        },
      },
      parent_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'medications',
          },
          key: 'id',
        },
      },
      second_parent_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'medications',
          },
          key: 'id',
        },
      },
      data: {
        type: Sequelize.JSONB,
      },
      updated_attributes: {
        type: Sequelize.JSONB,
      },
      updated_data_attributes: {
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
      created_by_agency_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'agencies',
          },
          key: 'id',
        },
      },
      updated_by_agency_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'agencies',
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
    await queryInterface.dropTable('medications');
  },
};
