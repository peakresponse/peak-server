module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return queryInterface
        .createTable(
          'states',
          {
            id: {
              allowNull: false,
              primaryKey: true,
              type: Sequelize.UUID,
              defaultValue: Sequelize.literal('gen_random_uuid()'),
            },
            code: {
              allowNull: false,
              type: Sequelize.STRING,
            },
            name: {
              allowNull: false,
              type: Sequelize.STRING,
            },
            data_set: {
              type: Sequelize.JSONB,
            },
            data_set_xml: {
              type: Sequelize.TEXT,
            },
            schematron_xml: {
              type: Sequelize.TEXT,
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
        .then(() => {
          return queryInterface.addIndex('states', {
            fields: ['code'],
            unique: true,
            transaction,
          });
        });
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('states');
  },
};
