module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.sequelize.query(`ALTER TYPE enum_list_items_system RENAME VALUE 'ICD10CM' TO '9924001'`);
    await queryInterface.sequelize.query(`ALTER TYPE enum_list_items_system RENAME VALUE 'SNOMED' TO '9924005'`);
    await queryInterface.sequelize.query(`ALTER TYPE enum_list_items_system RENAME VALUE 'RXNORM' TO '9924003'`);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.sequelize.query(`ALTER TYPE enum_list_items_system RENAME VALUE '9924001' TO 'ICD10CM'`);
    await queryInterface.sequelize.query(`ALTER TYPE enum_list_items_system RENAME VALUE '9924005' TO 'SNOMED'`);
    await queryInterface.sequelize.query(`ALTER TYPE enum_list_items_system RENAME VALUE '9924003' TO 'RXNORM'`);
  },
};
