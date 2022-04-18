module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.renameColumn('employments', 'hired_at', 'hired_on', { transaction });
      await queryInterface.changeColumn('employments', 'hired_on', { type: Sequelize.DATEONLY }, { transaction });
      await queryInterface.renameColumn('employments', 'status_at', 'status_on', { transaction });
      await queryInterface.changeColumn('employments', 'status_on', { type: Sequelize.DATEONLY }, { transaction });
      await queryInterface.renameColumn('employments', 'started_at', 'started_on', { transaction });
      await queryInterface.changeColumn('employments', 'started_on', { type: Sequelize.DATEONLY }, { transaction });
      await queryInterface.renameColumn('employments', 'ended_at', 'ended_on', { transaction });
      await queryInterface.changeColumn('employments', 'ended_on', { type: Sequelize.DATEONLY }, { transaction });
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn('employments', 'ended_on', { type: Sequelize.DATE }, { transaction });
      await queryInterface.renameColumn('employments', 'ended_on', 'ended_at', { transaction });
      await queryInterface.changeColumn('employments', 'started_on', { type: Sequelize.DATE }, { transaction });
      await queryInterface.renameColumn('employments', 'started_on', 'started_at', { transaction });
      await queryInterface.changeColumn('employments', 'status_on', { type: Sequelize.DATE }, { transaction });
      await queryInterface.renameColumn('employments', 'status_on', 'status_at', { transaction });
      await queryInterface.changeColumn('employments', 'hired_on', { type: Sequelize.DATE }, { transaction });
      await queryInterface.renameColumn('employments', 'hired_on', 'hired_at', { transaction });
    });
  },
};
