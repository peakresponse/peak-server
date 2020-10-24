module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn('patients', 'predictions', Sequelize.JSONB, { transaction });
      await queryInterface.addColumn('patient_observations', 'predictions', Sequelize.JSONB, { transaction });
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('patients', 'predictions', { transaction });
      await queryInterface.removeColumn('patient_observations', 'predictions', { transaction });
    });
  },
};
