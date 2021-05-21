module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.sequelize.transaction(async (transaction) => {
      // fix missing NOT NULL constraints on scenes counter cache columns
      await queryInterface.sequelize.query(`ALTER TABLE scenes ALTER COLUMN patients_count SET NOT NULL`, { transaction });
      await queryInterface.sequelize.query(`ALTER TABLE scenes ALTER COLUMN priority_patients_counts SET NOT NULL`, { transaction });
      await queryInterface.sequelize.query(`ALTER TABLE scenes ALTER COLUMN responders_count SET NOT NULL`, { transaction });
      // remove unnecessary NOT NULL and DEFAULT constraints on scene_observation columns
      await queryInterface.sequelize.query(`ALTER TABLE scene_observations ALTER COLUMN is_active DROP DEFAULT`, { transaction });
      await queryInterface.sequelize.query(`ALTER TABLE scene_observations ALTER COLUMN is_active DROP NOT NULL`, { transaction });
      await queryInterface.sequelize.query(`ALTER TABLE scene_observations ALTER COLUMN is_mci DROP DEFAULT`, { transaction });
      await queryInterface.sequelize.query(`ALTER TABLE scene_observations ALTER COLUMN is_mci DROP NOT NULL`, { transaction });
      // rename approx_patients column, add NOT NULL and DEFAULT on scenes
      await queryInterface.sequelize.query(`ALTER TABLE scenes ALTER COLUMN approx_patients SET DEFAULT 0`, { transaction });
      await queryInterface.sequelize.query(`UPDATE scenes SET approx_patients=0 WHERE approx_patients IS NULL`, { transaction });
      await queryInterface.sequelize.query(`ALTER TABLE scenes ALTER COLUMN approx_patients SET NOT NULL`, { transaction });
      await queryInterface.renameColumn('scenes', 'approx_patients', 'approx_patients_count', { transaction });
      await queryInterface.renameColumn('scene_observations', 'approx_patients', 'approx_patients_count', { transaction });
      // add new approx_priority_patients_counts column
      await queryInterface.addColumn(
        'scenes',
        'approx_priority_patients_counts',
        {
          type: Sequelize.JSONB,
          allowNull: false,
          defaultValue: [0, 0, 0, 0, 0, 0],
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'scene_observations',
        'approx_priority_patients_counts',
        {
          type: Sequelize.JSONB,
        },
        { transaction }
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
      await queryInterface.removeColumn('scene_observations', 'approx_priority_patients_counts', { transaction });
      await queryInterface.removeColumn('scenes', 'approx_priority_patients_counts', { transaction });
      await queryInterface.renameColumn('scene_observations', 'approx_patients_count', 'approx_patients', { transaction });
      await queryInterface.renameColumn('scenes', 'approx_patients_count', 'approx_patients', { transaction });
      await queryInterface.sequelize.query(`ALTER TABLE scenes ALTER COLUMN approx_patients DROP NOT NULL`, { transaction });
      await queryInterface.sequelize.query(`UPDATE scenes SET approx_patients=NULL WHERE approx_patients=0`, { transaction });
      await queryInterface.sequelize.query(`ALTER TABLE scenes ALTER COLUMN approx_patients DROP DEFAULT`, { transaction });
      await queryInterface.sequelize.query(`ALTER TABLE scene_observations ALTER COLUMN is_active SET NOT NULL`, { transaction });
      await queryInterface.sequelize.query(`ALTER TABLE scene_observations ALTER COLUMN is_active SET DEFAULT true`, { transaction });
      await queryInterface.sequelize.query(`ALTER TABLE scene_observations ALTER COLUMN is_mci SET NOT NULL`, { transaction });
      await queryInterface.sequelize.query(`ALTER TABLE scene_observations ALTER COLUMN is_mci SET DEFAULT false`, { transaction });
      await queryInterface.sequelize.query(`ALTER TABLE scenes ALTER COLUMN responders_count DROP NOT NULL`, { transaction });
      await queryInterface.sequelize.query(`ALTER TABLE scenes ALTER COLUMN priority_patients_counts DROP NOT NULL`, { transaction });
      await queryInterface.sequelize.query(`ALTER TABLE scenes ALTER COLUMN patients_count DROP NOT NULL`, { transaction });
    });
  },
};
