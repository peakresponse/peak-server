module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.sequelize.transaction((transaction) =>
      queryInterface
        .createTable(
          'facilities',
          {
            id: {
              allowNull: false,
              primaryKey: true,
              type: Sequelize.UUID,
              defaultValue: Sequelize.literal('gen_random_uuid()'),
            },
            type: {
              type: Sequelize.STRING,
            },
            name: {
              type: Sequelize.STRING,
            },
            state_code: {
              type: Sequelize.STRING,
            },
            code: {
              type: Sequelize.STRING,
            },
            unit: {
              type: Sequelize.STRING,
            },
            address: {
              type: Sequelize.STRING,
            },
            city: {
              type: Sequelize.STRING,
            },
            state: {
              type: Sequelize.STRING,
            },
            zip: {
              type: Sequelize.STRING,
            },
            country: {
              type: Sequelize.STRING,
            },
            lat: {
              type: Sequelize.STRING,
            },
            lng: {
              type: Sequelize.STRING,
            },
            agency_id: {
              type: Sequelize.UUID,
              references: {
                model: {
                  tableName: 'agencies',
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
          queryInterface.addIndex('facilities', {
            fields: ['state_code', 'code'],
            unique: true,
            transaction,
          }),
        )
        .then(() =>
          queryInterface.addIndex('facilities', {
            fields: ['agency_id'],
            transaction,
          }),
        ),
    ),
  down: (queryInterface, Sequelize) => queryInterface.dropTable('facilities'),
};
