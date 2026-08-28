/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('section_elements', 'short_name', Sequelize.STRING);
    await queryInterface.addColumn('section_elements', 'unit', Sequelize.STRING);
    await queryInterface.addColumn('section_elements', 'visible_if', Sequelize.JSONB);
    await queryInterface.addColumn('section_elements', 'on_change', Sequelize.JSONB);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('section_elements', 'on_change');
    await queryInterface.removeColumn('section_elements', 'visible_if');
    await queryInterface.removeColumn('section_elements', 'unit');
    await queryInterface.removeColumn('section_elements', 'short_name');
  },
};
