/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('reports', 'priority', {
      type: Sequelize.INTEGER,
    });
    await queryInterface.addColumn('reports', 'filter_priority', {
      type: Sequelize.INTEGER,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('reports', 'priority');
    await queryInterface.removeColumn('reports', 'filter_priority');
  },
};
