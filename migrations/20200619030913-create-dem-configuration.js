'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable('configurations', {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('gen_random_uuid()')
        },
        agency_id: {
          allowNull: false,
          type: Sequelize.UUID
        },
        state_id: {
          allowNull: false,
          type: Sequelize.STRING
        },
        state_name: {
          type: Sequelize.STRING
        },
        data: {
          type: Sequelize.JSONB
        },
        created_by_id: {
          allowNull: false,
          type: Sequelize.UUID
        },
        updated_by_id: {
          allowNull: false,
          type: Sequelize.UUID
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }, {schema: 'demographics', transaction});
      await queryInterface.addConstraint('demographics.configurations', {
        type: 'FOREIGN KEY',
        fields: ['agency_id'],
        name: 'demographics.configurations_agency_id_demographics.agencies_fk',
        references: {
          table: {
            schema: 'demographics',
            tableName: 'agencies'
          },
          field: 'id'
        },
        transaction
      });
      await queryInterface.addConstraint('demographics.configurations', {
        type: 'FOREIGN KEY',
        fields: ['state_id'],
        references: {
          table: 'states',
          field: 'id'
        },
        transaction
      });
      await queryInterface.addConstraint('demographics.configurations', {
        type: 'FOREIGN KEY',
        fields: ['created_by_id'],
        references: {
          table: 'users',
          field: 'id'
        },
        transaction
      });
      await queryInterface.addConstraint('demographics.configurations', {
        type: 'FOREIGN KEY',
        fields: ['updated_by_id'],
        references: {
          table: 'users',
          field: 'id'
        },
        transaction
      });
      await queryInterface.addConstraint('demographics.configurations', {
        type: 'UNIQUE',
        fields: ['agency_id', 'state_id'],
        transaction
      });
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.dropTable({schema: 'demographics', tableName: 'configurations'}, {transaction});
    });
  }
};
