/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('responders', 'user_id', {
      type: Sequelize.UUID,
      allowNull: true,
    });
    await queryInterface.changeColumn('responders', 'agency_id', {
      type: Sequelize.UUID,
      allowNull: true,
    });
    await queryInterface.changeColumn('responders', 'arrived_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('responders', 'agency_name', {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn('responders', 'unit_number', {
      type: Sequelize.STRING,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('responders', 'unit_number');
    await queryInterface.removeColumn('responders', 'agency_name');
    await queryInterface.changeColumn('responders', 'arrived_at', {
      type: Sequelize.DATE,
      allowNull: false,
    });
    await queryInterface.changeColumn('responders', 'agency_id', {
      type: Sequelize.UUID,
      allowNull: false,
    });
    await queryInterface.changeColumn('responders', 'user_id', {
      type: Sequelize.UUID,
      allowNull: false,
    });
  },
};
