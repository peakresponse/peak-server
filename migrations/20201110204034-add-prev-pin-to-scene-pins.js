module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn('scene_pins', 'prev_pin_id', Sequelize.UUID, { transaction });
      await queryInterface.addConstraint('scene_pins', {
        type: 'FOREIGN KEY',
        fields: ['prev_pin_id'],
        references: {
          table: 'scene_pins',
          field: 'id',
        },
        transaction,
      });
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('scene_pins', 'prev_pin_id', { transaction });
    });
  },
};
