/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('clients', 'user_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    });
    // make redirectUri nullable
    await queryInterface.changeColumn('clients', 'redirect_uri', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`UPDATE clients SET redirect_uri=' ' WHERE redirect_uri IS NULL`);
    await queryInterface.changeColumn('clients', 'redirect_uri', {
      type: Sequelize.TEXT,
      allowNull: false,
    });
    await queryInterface.removeColumn('clients', 'user_id');
  },
};
