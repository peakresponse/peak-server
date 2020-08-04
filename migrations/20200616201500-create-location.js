'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable('locations', {
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
        type: {
          type: Sequelize.STRING
        },
        name: {
          type: Sequelize.STRING
        },
        number: {
          type: Sequelize.STRING
        },
        geog: {
          type: Sequelize.GEOMETRY
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
      await queryInterface.sequelize.query('CREATE INDEX "demographics.locations_geog_idx" ON demographics.locations USING gist(geog)', {transaction});
      await queryInterface.addConstraint('demographics.locations', {
        type: 'FOREIGN KEY',
        fields: ['agency_id'],
        name: 'demographics.locations_agency_id_demographics.agencies_fk',
        references: {
          table: {
            schema: 'demographics',
            tableName: 'agencies'
          },
          field: 'id'
        },
        transaction
      });
      await queryInterface.addConstraint('demographics.locations', {
        type: 'FOREIGN KEY',
        fields: ['created_by_id'],
        references: {
          table: 'users',
          field: 'id'
        },
        transaction
      });
      await queryInterface.addConstraint('demographics.locations', {
        type: 'FOREIGN KEY',
        fields: ['updated_by_id'],
        references: {
          table: 'users',
          field: 'id'
        },
        transaction
      });
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.dropTable({schema: 'demographics', tableName: 'locations'}, {transaction});
    });
  }
};
