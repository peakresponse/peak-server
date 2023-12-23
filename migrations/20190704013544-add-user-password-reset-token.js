module.exports = {
  up: (queryInterface, Sequelize) =>
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    queryInterface.sequelize.transaction((transaction) =>
      queryInterface
        .addColumn('users', 'password_reset_token', Sequelize.UUID, {
          allowNull: true,
          defaultValue: null,
          transaction,
        })
        .then(() =>
          queryInterface.addIndex('users', ['password_reset_token'], {
            indexName: 'users_password_reset_token_idx',
            unique: true,
            transaction,
          }),
        )
        .then(() =>
          queryInterface.addColumn('users', 'password_reset_token_expires_at', Sequelize.DATE, {
            allowNull: true,
            defaultValue: null,
            transaction,
          }),
        ),
    ),
  down: (queryInterface, Sequelize) =>
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    queryInterface.sequelize.transaction((transaction) =>
      queryInterface
        .removeColumn('users', 'password_reset_token', { transaction })
        .then(() => queryInterface.removeColumn('users', 'password_reset_token_expires_at', { transaction })),
    ),
};
