module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('nemsis_schematrons', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        type: Sequelize.UUID,
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
      data_set: {
        allowNull: false,
        type: Sequelize.STRING,
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
      file_name: {
        type: Sequelize.STRING,
      },
      file_version: {
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
      'CREATE UNIQUE INDEX nemsis_schematrons_state_id_version_uk ON nemsis_schematrons (state_id, version) WHERE state_id IS NOT NULL AND version IS NOT NULL'
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('nemsis_schematrons');
  },
};
