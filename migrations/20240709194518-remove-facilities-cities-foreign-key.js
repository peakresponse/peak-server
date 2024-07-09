/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('facilities', 'facilities_city_id_cities_fk');
    await queryInterface.addIndex('facilities', ['city_id']);
    await queryInterface.removeConstraint('facilities', 'facilities_county_id_counties_fk');
    await queryInterface.addIndex('facilities', ['county_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addConstraint('facilities', {
      type: 'FOREIGN KEY',
      fields: ['county_id'],
      references: {
        table: 'counties',
        field: 'id',
      },
    });
    await queryInterface.addConstraint('facilities', {
      type: 'FOREIGN KEY',
      fields: ['city_id'],
      references: {
        table: 'cities',
        field: 'id',
      },
    });
  },
};
