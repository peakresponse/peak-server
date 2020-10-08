module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'responders',
        'role',
        { type: Sequelize.ENUM('STAGING', 'TRANSPORT', 'TRIAGE', 'TREATMENT') },
        { transaction }
      );
      await queryInterface.sequelize.query(
        'CREATE UNIQUE INDEX responders_scene_id_role_uk ON responders (scene_id, role) WHERE departed_at IS NULL',
        { transaction }
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('responders', 'role', { transaction });
      await queryInterface.sequelize.query('DROP TYPE enum_responders_role', {
        transaction,
      });
    });
  },
};
