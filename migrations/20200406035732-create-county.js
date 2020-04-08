'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(function(transaction) {
      return queryInterface.createTable('counties', {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('gen_random_uuid()')
        },
        state_abbr: {
          allowNull: false,
          type: Sequelize.STRING
        },
        state_code: {
          allowNull: false,
          type: Sequelize.STRING
        },
        county_code: {
          allowNull: false,
          type: Sequelize.STRING
        },
        name: {
          allowNull: false,
          type: Sequelize.STRING
        },
        class_code: {
          allowNull: false,
          type: Sequelize.STRING
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }, {transaction}).then(function() {
        return queryInterface.addIndex('counties', {
          fields: ['state_code', 'county_code'],
          unique: true,
          transaction
        });
      });
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('counties');
  }
};
