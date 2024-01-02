/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('exports', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        type: Sequelize.UUID,
      },
      name: {
        allowNull: false,
        type: Sequelize.CITEXT,
      },
      type: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      auth_url: {
        type: Sequelize.TEXT,
      },
      api_url: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      username: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      encrypted_password: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      organization: {
        type: Sequelize.TEXT,
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
      agency_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'agencies',
          },
          key: 'id',
        },
      },
      is_visible: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_approval_reqd: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_overridable: {
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('exports');
  },
};
