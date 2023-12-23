module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.sequelize.transaction((transaction) =>
      queryInterface
        .createTable(
          'counties',
          {
            id: {
              allowNull: false,
              primaryKey: true,
              type: Sequelize.UUID,
              defaultValue: Sequelize.literal('gen_random_uuid()'),
            },
            state_abbr: {
              allowNull: false,
              type: Sequelize.STRING,
            },
            state_code: {
              allowNull: false,
              type: Sequelize.STRING,
            },
            county_code: {
              allowNull: false,
              type: Sequelize.STRING,
            },
            name: {
              allowNull: false,
              type: Sequelize.STRING,
            },
            class_code: {
              allowNull: false,
              type: Sequelize.STRING,
            },
            created_at: {
              allowNull: false,
              type: Sequelize.DATE,
            },
            updated_at: {
              allowNull: false,
              type: Sequelize.DATE,
            },
          },
          { transaction },
        )
        .then(() =>
          queryInterface.addIndex('counties', {
            fields: ['state_code', 'county_code'],
            unique: true,
            transaction,
          }),
        ),
    ),
  down: (queryInterface, Sequelize) => queryInterface.dropTable('counties'),
};
