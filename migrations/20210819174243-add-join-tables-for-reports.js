module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('reports_medications', {
      report_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: {
            tableName: 'reports',
          },
          key: 'id',
        },
      },
      medication_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: {
            tableName: 'medications',
          },
          key: 'id',
        },
      },
    });
    await queryInterface.addIndex('reports_medications', ['report_id', 'medication_id'], { unique: true });

    await queryInterface.createTable('reports_procedures', {
      report_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: {
            tableName: 'reports',
          },
          key: 'id',
        },
      },
      procedure_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: {
            tableName: 'procedures',
          },
          key: 'id',
        },
      },
    });
    await queryInterface.addIndex('reports_procedures', ['report_id', 'procedure_id'], { unique: true });

    await queryInterface.createTable('reports_vitals', {
      report_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: {
            tableName: 'reports',
          },
          key: 'id',
        },
      },
      vital_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: {
            tableName: 'vitals',
          },
          key: 'id',
        },
      },
    });
    await queryInterface.addIndex('reports_vitals', ['report_id', 'vital_id'], { unique: true });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('reports_vitals');
    await queryInterface.dropTable('reports_procedures');
    await queryInterface.dropTable('reports_medications');
  },
};
