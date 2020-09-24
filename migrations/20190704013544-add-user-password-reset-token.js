module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.sequelize.transaction((transaction) => {
      return queryInterface
        .addColumn('users', 'password_reset_token', Sequelize.UUID, {
          allowNull: true,
          defaultValue: null,
          transaction,
        })
        .then(() => {
          return queryInterface.addIndex('users', ['password_reset_token'], {
            indexName: 'users_password_reset_token_idx',
            unique: true,
            transaction,
          });
        })
        .then(() => {
          return queryInterface.addColumn(
            'users',
            'password_reset_token_expires_at',
            Sequelize.DATE,
            {
              allowNull: true,
              defaultValue: null,
              transaction,
            }
          );
        });
    });
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return queryInterface.sequelize.transaction((transaction) => {
      return queryInterface
        .removeColumn('users', 'password_reset_token', { transaction })
        .then(() => {
          return queryInterface.removeColumn(
            'users',
            'password_reset_token_expires_at',
            { transaction }
          );
        });
    });
  },
};
