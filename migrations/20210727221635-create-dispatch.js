module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('dispatches', {
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
            tableName: 'dispatches',
          },
          key: 'id',
        },
      },
      parent_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'dispatches',
          },
          key: 'id',
        },
      },
      second_parent_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'dispatches',
          },
          key: 'id',
        },
      },
      incident_id: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'incidents',
          },
          key: 'id',
        },
      },
      vehicle_id: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'vehicles',
          },
          key: 'id',
        },
      },
      dispatched_at: {
        type: Sequelize.DATE,
      },
      acknowledged_at: {
        type: Sequelize.DATE,
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
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX dispatches_incident_id_vehicle_id ON dispatches (incident_id, vehicle_id) WHERE canonical_id IS NULL',
    );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('dispatches');
  },
};
