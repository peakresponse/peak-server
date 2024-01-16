/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('export_logs', {
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
      export_trigger_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'export_triggers',
          },
          key: 'id',
        },
      },
      report_id: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'reports',
          },
          key: 'id',
        },
      },
      params: {
        type: Sequelize.JSONB,
      },
      result: {
        type: Sequelize.JSONB,
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
    await queryInterface.dropTable('export_logs');
  },
};
