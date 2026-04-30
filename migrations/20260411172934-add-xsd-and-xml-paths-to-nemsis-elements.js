module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('nemsis_elements', 'xsd_path', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('nemsis_elements', 'xml_path', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('nemsis_elements', 'xsd_path');
    await queryInterface.removeColumn('nemsis_elements', 'xml_path');
  },
};
