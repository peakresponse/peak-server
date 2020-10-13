module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(`CREATE EXTENSION IF NOT EXISTS citext;`, { transaction });
      await queryInterface.changeColumn({ schema: 'demographics', tableName: 'agencies' }, 'subdomain', Sequelize.CITEXT, { transaction });
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn({ schema: 'demographics', tableName: 'agencies' }, 'subdomain', Sequelize.STRING, { transaction });
      await queryInterface.sequelize.query(`DROP EXTENSION IF EXISTS citext;`, {
        transaction,
      });
    });
  },
};
