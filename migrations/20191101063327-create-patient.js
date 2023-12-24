module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.sequelize.transaction((transaction) =>
      queryInterface
        .createTable(
          'patients',
          {
            id: {
              allowNull: false,
              primaryKey: true,
              type: Sequelize.UUID,
              defaultValue: Sequelize.literal('gen_random_uuid()'),
            },
            version: {
              type: Sequelize.INTEGER,
              allowNull: false,
            },
            pin: {
              allowNull: false,
              type: Sequelize.STRING,
            },
            last_name: {
              type: Sequelize.STRING,
            },
            first_name: {
              type: Sequelize.STRING,
            },
            age: {
              type: Sequelize.INTEGER,
            },
            dob: {
              type: Sequelize.DATEONLY,
            },
            respiratory_rate: {
              type: Sequelize.INTEGER,
            },
            pulse: {
              type: Sequelize.INTEGER,
            },
            capillary_refill: {
              type: Sequelize.INTEGER,
            },
            blood_pressure: {
              type: Sequelize.STRING,
            },
            text: {
              type: Sequelize.TEXT,
            },
            priority: {
              type: Sequelize.INTEGER,
              allowNull: false,
            },
            location: {
              type: Sequelize.TEXT,
            },
            lat: {
              type: Sequelize.STRING,
            },
            lng: {
              type: Sequelize.STRING,
            },
            transport_method_id: {
              type: Sequelize.UUID,
              references: {
                model: {
                  tableName: 'transports',
                },
                key: 'id',
              },
            },
            transport_to_id: {
              type: Sequelize.UUID,
              references: {
                model: {
                  tableName: 'destinations',
                },
                key: 'id',
              },
            },
            portrait_url: {
              type: Sequelize.TEXT,
            },
            photo_url: {
              type: Sequelize.TEXT,
            },
            audio_url: {
              type: Sequelize.TEXT,
            },
            created_at: {
              allowNull: false,
              type: Sequelize.DATE,
            },
            created_by_id: {
              allowNull: false,
              type: Sequelize.UUID,
              references: {
                model: {
                  tableName: 'users',
                },
                key: 'id',
              },
            },
            updated_at: {
              allowNull: false,
              type: Sequelize.DATE,
            },
            updated_by_id: {
              allowNull: false,
              type: Sequelize.UUID,
              references: {
                model: {
                  tableName: 'users',
                },
                key: 'id',
              },
            },
          },
          { transaction },
        )
        .then(() =>
          queryInterface.addIndex('patients', {
            fields: [Sequelize.fn('lower', Sequelize.col('pin'))],
            unique: true,
            name: 'patients_pin_idx',
            transaction,
          }),
        ),
    ),
  down: (queryInterface, Sequelize) => queryInterface.dropTable('patients'),
};
