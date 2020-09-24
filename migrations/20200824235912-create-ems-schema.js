module.exports = {
  up: async (queryInterface, Sequelize) => {
    /// create a new ems schema
    await queryInterface.sequelize.createSchema('ems');
  },

  down: async (queryInterface, Sequelize) => {
    /// create a new ems schema
    await queryInterface.sequelize.dropSchema('ems');
  },
};
