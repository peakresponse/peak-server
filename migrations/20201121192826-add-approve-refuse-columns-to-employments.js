module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn('employments', 'approved_at', Sequelize.DATE, { transaction });
      await queryInterface.addColumn('employments', 'approved_by_id', Sequelize.UUID, { transaction });
      await queryInterface.addColumn('employments', 'refused_at', Sequelize.DATE, { transaction });
      await queryInterface.addColumn('employments', 'refused_by_id', Sequelize.UUID, { transaction });
      await queryInterface.addConstraint('employments', {
        type: 'FOREIGN KEY',
        fields: ['approved_by_id'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('employments', {
        type: 'FOREIGN KEY',
        fields: ['refused_by_id'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction,
      });
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('employments', 'approved_at', { transaction });
      await queryInterface.removeColumn('employments', 'approved_by_id', { transaction });
      await queryInterface.removeColumn('employments', 'refused_at', { transaction });
      await queryInterface.removeColumn('employments', 'refused_by_id', { transaction });
    });
  },
};
