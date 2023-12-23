module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query('CREATE EXTENSION postgis', {
        transaction,
      });
      await queryInterface.addColumn('facilities', 'geog', 'geography', {
        transaction,
      });
      await queryInterface.sequelize.query('CREATE INDEX facilities_geog_idx ON facilities USING gist(geog)', { transaction });
      await queryInterface.sequelize.query(
        'UPDATE facilities SET geog=ST_MakePoint(CAST(lng AS FLOAT), CAST(lat AS FLOAT)) WHERE lat IS NOT NULL AND lng IS NOT NULL',
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('facilities', 'geog', { transaction });
      await queryInterface.sequelize.query('DROP EXTENSION postgis', {
        transaction,
      });
    });
  },
};
