module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('agencies', 'nemsis_version', { type: Sequelize.STRING });
    await queryInterface.addColumn('agencies', 'state_data_set_id', {
      type: Sequelize.UUID,
      references: {
        model: {
          tableName: 'nemsis_state_data_sets',
        },
        key: 'id',
      },
    });
    await queryInterface.addColumn('agencies', 'state_schematron_id', {
      type: Sequelize.UUID,
      references: {
        model: {
          tableName: 'nemsis_state_schematrons',
        },
        key: 'id',
      },
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('agencies', 'nemsis_version');
    await queryInterface.removeColumn('agencies', 'state_data_set_id');
    await queryInterface.removeColumn('agencies', 'state_schematron_id');
  },
};
