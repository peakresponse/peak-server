/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('versions', 'file', Sequelize.STRING);
    await queryInterface.addColumn('versions', 'file_name', Sequelize.STRING);
    await queryInterface.addColumn('versions', 'status', Sequelize.JSONB);
    await queryInterface.addColumn('versions', 'is_cancelled', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('versions', 'is_cancelled');
    await queryInterface.removeColumn('versions', 'status');
    await queryInterface.removeColumn('versions', 'file_name');
    await queryInterface.removeColumn('versions', 'file');
  },
};
