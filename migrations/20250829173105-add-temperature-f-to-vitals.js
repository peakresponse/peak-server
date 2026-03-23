/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('vitals', 'temperature_f', Sequelize.STRING);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('vitals', 'temperature_f');
  },
};
