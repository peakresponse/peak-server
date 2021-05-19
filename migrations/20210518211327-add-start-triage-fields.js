module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('patients', 'triage_mental_status', {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn('patients', 'triage_perfusion', {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn('patient_observations', 'triage_mental_status', {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn('patient_observations', 'triage_perfusion', {
      type: Sequelize.STRING,
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('patient_observations', 'triage_mental_status');
    await queryInterface.removeColumn('patient_observations', 'triage_perfusion');
    await queryInterface.removeColumn('patients', 'triage_mental_status');
    await queryInterface.removeColumn('patients', 'triage_perfusion');
  },
};
