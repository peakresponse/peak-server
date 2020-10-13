module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('patients', 'blood_pressure', {
        transaction,
      });
      await queryInterface.removeColumn('patient_observations', 'blood_pressure', {
        transaction,
      });
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn('patients', 'blood_pressure', { type: Sequelize.STRING }, { transaction });
      await queryInterface.addColumn('patient_observations', 'blood_pressure', { type: Sequelize.STRING }, { transaction });
    });
  },
};
