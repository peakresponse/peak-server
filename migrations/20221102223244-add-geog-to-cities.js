module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn('cities', 'geog', 'geography', {
        transaction,
      });
      await queryInterface.sequelize.query('CREATE INDEX cities_geog_idx ON facilities USING gist(geog)', { transaction });
      await queryInterface.sequelize.query(
        'UPDATE cities SET geog=ST_MakePoint(CAST(primary_longitude AS FLOAT), CAST(primary_latitude AS FLOAT)) WHERE primary_latitude IS NOT NULL AND primary_longitude IS NOT NULL',
        { transaction }
      );
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('cities', 'geog');
  },
};
