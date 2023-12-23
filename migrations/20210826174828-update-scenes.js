module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'scenes',
        'canonical_id',
        {
          type: Sequelize.UUID,
          references: {
            model: {
              tableName: 'scenes',
            },
            key: 'id',
          },
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'scenes',
        'parent_id',
        {
          type: Sequelize.UUID,
          references: {
            model: {
              tableName: 'scenes',
            },
            key: 'id',
          },
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'scenes',
        'second_parent_id',
        {
          type: Sequelize.UUID,
          references: {
            model: {
              tableName: 'scenes',
            },
            key: 'id',
          },
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'scenes',
        'data',
        {
          type: Sequelize.JSONB,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'scenes',
        'updated_attributes',
        {
          type: Sequelize.JSONB,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'scenes',
        'updated_data_attributes',
        {
          type: Sequelize.JSONB,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'scenes',
        'is_valid',
        {
          allowNull: false,
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'scenes',
        'validation_errors',
        {
          type: Sequelize.JSONB,
        },
        { transaction },
      );
      await queryInterface.sequelize.query(`UPDATE scene_observations SET id=gen_random_uuid() WHERE id=scene_id`, { transaction });
      await queryInterface.sequelize.query(
        `INSERT INTO scenes(id, canonical_id, name, "desc", urgency, note, approx_patients_count, is_active, is_mci, lat, lng, geog, address1, address2, city_id, county_id, state_id, zip, created_by_id, updated_by_id, created_by_agency_id, updated_by_agency_id, created_at, updated_at, closed_at, incident_commander_id, incident_commander_agency_id, approx_priority_patients_counts) SELECT id, scene_id AS canonical_id, name, "desc", urgency, note, COALESCE(approx_patients_count, 0), COALESCE(is_active, TRUE), COALESCE(is_mci, TRUE), lat, lng, geog, address1, address2, city_id, county_id, state_id, zip, created_by_id, updated_by_id, created_by_agency_id, updated_by_agency_id, created_at, updated_at, closed_at, incident_commander_id, incident_commander_agency_id, COALESCE(approx_priority_patients_counts, '[]') FROM scene_observations`,
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query('DELETE FROM scenes WHERE canonical_id IS NOT NULL', { transaction });
      await queryInterface.removeColumn('scenes', 'validation_errors', { transaction });
      await queryInterface.removeColumn('scenes', 'is_valid', { transaction });
      await queryInterface.removeColumn('scenes', 'updated_data_attributes', { transaction });
      await queryInterface.removeColumn('scenes', 'updated_attributes', { transaction });
      await queryInterface.removeColumn('scenes', 'data', { transaction });
      await queryInterface.removeColumn('scenes', 'second_parent_id', { transaction });
      await queryInterface.removeColumn('scenes', 'parent_id', { transaction });
      await queryInterface.removeColumn('scenes', 'canonical_id', { transaction });
    });
  },
};
