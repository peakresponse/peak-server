'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('agencies', 'nemsis_version', { type: Sequelize.STRING });
    await queryInterface.addColumn('agencies', 'state_data_set_version', { type: Sequelize.STRING });
    await queryInterface.addColumn('agencies', 'state_schematron_version', { type: Sequelize.STRING });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('agencies', 'nemsis_version');
    await queryInterface.removeColumn('agencies', 'state_data_set_version');
    await queryInterface.removeColumn('agencies', 'state_schematron_version');
  }
};
