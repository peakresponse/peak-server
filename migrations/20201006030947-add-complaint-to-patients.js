module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'patients',
        'complaint',
        { type: Sequelize.STRING },
        { transaction }
      );
      await queryInterface.addColumn(
        'patient_observations',
        'complaint',
        { type: Sequelize.STRING },
        { transaction }
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('patients', 'complaint', {
        transaction,
      });
      await queryInterface.removeColumn('patient_observations', 'complaint', {
        transaction,
      });
    });
  },
};
