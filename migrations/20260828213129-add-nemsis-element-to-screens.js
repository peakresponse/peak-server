/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('screens', 'nemsis_element_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: {
          tableName: 'nemsis_elements',
        },
        key: 'id',
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('screens', 'nemsis_element_id');
  },
};
