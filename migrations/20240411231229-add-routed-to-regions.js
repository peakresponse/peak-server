/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('regions', 'routed_url', {
      type: Sequelize.TEXT,
    });
    await queryInterface.addColumn('regions', 'routed_client_id', {
      type: Sequelize.TEXT,
    });
    await queryInterface.addColumn('regions', 'routed_encrypted_client_secret', {
      type: Sequelize.TEXT,
    });
    await queryInterface.addColumn('regions', 'routed_credentials', {
      type: Sequelize.JSONB,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('regions', 'routed_credentials');
    await queryInterface.removeColumn('regions', 'routed_encrypted_client_secret');
    await queryInterface.removeColumn('regions', 'routed_client_id');
    await queryInterface.removeColumn('regions', 'routed_url');
  },
};
