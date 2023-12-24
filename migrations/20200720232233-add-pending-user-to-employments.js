module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        { schema: 'demographics', tableName: 'employments' },
        'is_pending',
        {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn({ schema: 'demographics', tableName: 'employments' }, 'is_pending', { transaction });
    });
  },
};
