module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('incidents', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        type: Sequelize.UUID,
      },
      psap_id: {
        type: Sequelize.STRING,
        references: {
          model: {
            tableName: 'psaps',
          },
          key: 'id',
        },
      },
      scene_id: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'scenes',
          },
          key: 'id',
        },
      },
      number: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      called_at: {
        type: Sequelize.DATE,
      },
      dispatch_notified_at: {
        type: Sequelize.DATE,
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
    await queryInterface.addIndex('incidents', {
      fields: ['psap_id', 'number'],
      unique: true,
    });
    await queryInterface.sequelize.query(`ALTER TABLE scenes ALTER COLUMN incident_commander_id DROP NOT NULL`);
    await queryInterface.sequelize.query(`ALTER TABLE scenes ALTER COLUMN incident_commander_agency_id DROP NOT NULL`);
    await queryInterface.sequelize.query(`ALTER TABLE scenes ALTER COLUMN created_by_agency_id DROP NOT NULL`);
    await queryInterface.sequelize.query(`ALTER TABLE scene_observations ALTER COLUMN created_by_agency_id DROP NOT NULL`);
    await queryInterface.sequelize.query(`ALTER TABLE scenes ALTER COLUMN updated_by_agency_id DROP NOT NULL`);
    await queryInterface.sequelize.query(`ALTER TABLE scene_observations ALTER COLUMN updated_by_agency_id DROP NOT NULL`);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`ALTER TABLE scenes ALTER COLUMN incident_commander_id SET NOT NULL`);
    await queryInterface.sequelize.query(`ALTER TABLE scenes ALTER COLUMN incident_commander_agency_id SET NOT NULL`);
    await queryInterface.sequelize.query(`ALTER TABLE scenes ALTER COLUMN created_by_agency_id SET NOT NULL`);
    await queryInterface.sequelize.query(`ALTER TABLE scene_observations ALTER COLUMN created_by_agency_id SET NOT NULL`);
    await queryInterface.sequelize.query(`ALTER TABLE scenes ALTER COLUMN updated_by_agency_id SET NOT NULL`);
    await queryInterface.sequelize.query(`ALTER TABLE scene_observations ALTER COLUMN updated_by_agency_id SET NOT NULL`);
    await queryInterface.dropTable('incidents');
  },
};
