/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.addColumn('scenes', 'transp_patients_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    queryInterface.addColumn('scenes', 'transp_priority_patients_counts', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [0, 0, 0, 0, 0, 0],
    });
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn('scenes', 'transp_patients_count');
    queryInterface.removeColumn('scenes', 'transp_priority_patients_counts');
  },
};
