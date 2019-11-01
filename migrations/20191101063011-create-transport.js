'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(function(transaction) {
      return queryInterface.createTable('transports', {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('gen_random_uuid()')
        },
        name: {
          allowNull: false,
          type: Sequelize.STRING
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        created_by_id: {
          allowNull: false,
          type: Sequelize.UUID,
          references: {
            model: {
              tableName: 'users'
            },
            key: 'id'
          }
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_by_id: {
          allowNull: false,
          type: Sequelize.UUID,
          references: {
            model: {
              tableName: 'users'
            },
            key: 'id'
          }
        }
      }, {transaction}).then(function() {
        return queryInterface.addIndex('transports', {
          fields: [Sequelize.fn('lower', Sequelize.col('name'))],
          unique: true,
          name: 'transports_name_idx',
          transaction
        });
      });
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('transports');
  }
};
