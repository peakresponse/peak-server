module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeIndex('patients', 'patients_pin_idx', {
        transaction,
      });
      await queryInterface.changeColumn(
        'patients',
        'pin',
        { type: Sequelize.CITEXT, allowNull: false },
        { transaction }
      );
      await queryInterface.addConstraint('patients', {
        type: 'UNIQUE',
        fields: ['scene_id', 'pin'],
        transaction,
      });
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeConstraint(
        'patients',
        'patients_scene_id_pin_uk',
        { transaction }
      );
      await queryInterface.addIndex('patients', {
        fields: [Sequelize.fn('lower', Sequelize.col('pin'))],
        unique: true,
        name: 'patients_pin_idx',
        transaction,
      });
    });
  },
};
