module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.sequelize.transaction((transaction) =>
      queryInterface
        .createTable(
          'agencies',
          {
            id: {
              allowNull: false,
              primaryKey: true,
              type: Sequelize.UUID,
              defaultValue: Sequelize.literal('gen_random_uuid()'),
            },
            state_number: {
              allowNull: false,
              type: Sequelize.STRING,
            },
            number: {
              allowNull: false,
              type: Sequelize.STRING,
            },
            name: {
              type: Sequelize.STRING,
            },
            state_id: {
              type: Sequelize.UUID,
              allowNull: false,
              references: {
                model: {
                  tableName: 'states',
                },
                key: 'id',
              },
            },
            data_set: {
              type: Sequelize.JSONB,
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
          queryInterface.addIndex('agencies', {
            fields: ['state_id', 'state_number'],
            unique: true,
            transaction,
          }),
        ),
    ),
  down: (queryInterface, Sequelize) => queryInterface.dropTable('agencies'),
};
