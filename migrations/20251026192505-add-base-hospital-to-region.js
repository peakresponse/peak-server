/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('regions', 'base_hospital_facility_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'facilities',
        key: 'id',
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('regions', 'base_hospital_facility_id');
  },
};
