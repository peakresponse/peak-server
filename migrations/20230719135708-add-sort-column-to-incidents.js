module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('incidents', 'sort', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('incidents', 'sort');
  },
};
