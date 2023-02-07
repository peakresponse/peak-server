module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.removeIndex('facilities', 'cities_geog_idx');
    await queryInterface.sequelize.query('CREATE INDEX cities_geog_idx ON cities USING gist(geog)');
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeIndex('cities', 'cities_geog_idx');
    await queryInterface.sequelize.query('CREATE INDEX cities_geog_idx ON facilities USING gist(geog)');
  },
};
