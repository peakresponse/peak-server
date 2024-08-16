/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('incidents', 'sort', Sequelize.BIGINT);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('incidents', 'sort', Sequelize.INTEGER);
  },
};
