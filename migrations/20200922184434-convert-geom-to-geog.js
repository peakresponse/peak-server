module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn('scenes', 'geog', Sequelize.GEOGRAPHY, {
        transaction,
      });
      await queryInterface.changeColumn(
        'scene_observations',
        'geog',
        Sequelize.GEOGRAPHY,
        { transaction }
      );
      await queryInterface.changeColumn(
        'locations',
        'geog',
        Sequelize.GEOGRAPHY,
        { transaction }
      );
      await queryInterface.addColumn('patients', 'geog', Sequelize.GEOGRAPHY, {
        transaction,
      });
      await queryInterface.addColumn(
        'patient_observations',
        'geog',
        Sequelize.GEOGRAPHY,
        { transaction }
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn(
        'scenes',
        'geog',
        {
          type: 'GEOMETRY USING CAST("geog" AS GEOMETRY)',
        },
        { transaction }
      );
      await queryInterface.changeColumn(
        'scene_observations',
        'geog',
        {
          type: 'GEOMETRY USING CAST("geog" AS GEOMETRY)',
        },
        { transaction }
      );
      await queryInterface.changeColumn(
        'locations',
        'geog',
        {
          type: 'GEOMETRY USING CAST("geog" AS GEOMETRY)',
        },
        { transaction }
      );
      await queryInterface.removeColumn('patients', 'geog', { transaction });
      await queryInterface.removeColumn('patient_observations', 'geog', {
        transaction,
      });
    });
  },
};
