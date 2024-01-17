/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('export_triggers', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        type: Sequelize.UUID,
      },
      export_id: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'exports',
          },
          key: 'id',
        },
      },
      agency_id: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'agencies',
          },
          key: 'id',
        },
      },
      type: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      debounce_time: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      is_enabled: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      approved_by_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'users',
          },
          key: 'id',
        },
      },
      approved_at: {
        type: Sequelize.DATE,
      },
      username: {
        type: Sequelize.TEXT,
      },
      encrypted_password: {
        type: Sequelize.TEXT,
      },
      organization: {
        type: Sequelize.TEXT,
      },
      credentials: {
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
    await queryInterface.addIndex('export_triggers', ['export_id', 'agency_id'], { unique: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('export_triggers');
  },
};
