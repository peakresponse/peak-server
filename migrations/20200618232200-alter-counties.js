module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      /// drop the primary key on counties
      await queryInterface.removeColumn('counties', 'id', { transaction });
      /// add what will become the new primary key
      await queryInterface.addColumn('counties', 'id', { type: Sequelize.STRING }, { transaction });
      /// update all of its values from the other columns
      await queryInterface.sequelize.query(`UPDATE counties SET id=CONCAT(state_code,county_code)`, { transaction });
      /// make it the new primary key
      await queryInterface.addConstraint('counties', {
        type: 'PRIMARY KEY',
        fields: ['id'],
        transaction,
      });
    });
  },
  down: async (queryInterface, Sequelize) => {},
};
