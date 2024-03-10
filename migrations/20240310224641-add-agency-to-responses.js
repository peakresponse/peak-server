/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('responses', 'agency_id', {
      type: Sequelize.UUID,
      references: {
        model: {
          tableName: 'agencies',
        },
        key: 'id',
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('responses', 'agency_id');
  },
};
