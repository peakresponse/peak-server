module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'scenes',
        'patients_count',
        {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        {
          allowNull: false,
          transaction,
        },
      );
      await queryInterface.addColumn(
        'scenes',
        'priority_patients_counts',
        {
          type: Sequelize.JSONB,
          defaultValue: [0, 0, 0, 0, 0, 0],
        },
        {
          allowNull: false,
          transaction,
        },
      );
      await queryInterface.addColumn(
        'scenes',
        'responders_count',
        {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        {
          allowNull: false,
          transaction,
        },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('scenes', 'patients_count', {
        transaction,
      });
      await queryInterface.removeColumn('scenes', 'priority_patients_counts', {
        transaction,
      });
      await queryInterface.removeColumn('scenes', 'responders_count', {
        transaction,
      });
    });
  },
};
