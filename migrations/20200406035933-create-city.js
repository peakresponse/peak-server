module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return queryInterface
        .createTable(
          'cities',
          {
            id: {
              allowNull: false,
              primaryKey: true,
              type: Sequelize.UUID,
              defaultValue: Sequelize.literal('gen_random_uuid()'),
            },
            feature_id: {
              allowNull: false,
              type: Sequelize.STRING,
            },
            feature_name: {
              type: Sequelize.STRING,
            },
            feature_class: {
              type: Sequelize.STRING,
            },
            census_code: {
              type: Sequelize.STRING,
            },
            census_class_code: {
              type: Sequelize.STRING,
            },
            gsa_code: {
              type: Sequelize.STRING,
            },
            opm_code: {
              type: Sequelize.STRING,
            },
            state_numeric: {
              type: Sequelize.STRING,
            },
            state_alpha: {
              type: Sequelize.STRING,
            },
            county_sequence: {
              type: Sequelize.STRING,
            },
            county_numeric: {
              type: Sequelize.STRING,
            },
            county_name: {
              type: Sequelize.STRING,
            },
            primary_latitude: {
              type: Sequelize.STRING,
            },
            primary_longitude: {
              type: Sequelize.STRING,
            },
            date_created: {
              type: Sequelize.STRING,
            },
            date_edited: {
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
          { transaction }
        )
        .then(() => {
          return queryInterface.addIndex('cities', {
            fields: ['feature_id'],
            unique: true,
            transaction,
          });
        });
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('cities');
  },
};
