module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'responders',
        'departed_at',
        Sequelize.DATE,
        { transaction }
      );
      await queryInterface.addConstraint('responders', {
        type: 'UNIQUE',
        fields: ['scene_id', 'user_id', 'arrived_at'],
        transaction,
      });
      await queryInterface.sequelize.query(
        'ALTER TABLE responders ALTER COLUMN arrived_at SET NOT NULL',
        { transaction }
      );
      await queryInterface.sequelize.query(
        'CREATE UNIQUE INDEX responders_scene_id_user_id ON responders (scene_id, user_id) WHERE departed_at IS NULL',
        { transaction }
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('responders', 'departed_at', {
        transaction,
      });
      await queryInterface.sequelize.query(
        'ALTER TABLE responders ALTER COLUMN arrived_at DROP NOT NULL',
        { transaction }
      );
      await queryInterface.removeConstraint(
        'responders',
        'responders_scene_id_user_id_arrived_at_uk',
        { transaction }
      );
    });
  },
};
