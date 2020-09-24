module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'scenes',
        {
          id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: Sequelize.literal('gen_random_uuid()'),
          },
          name: {
            type: Sequelize.STRING,
          },
          desc: {
            type: Sequelize.TEXT,
          },
          urgency: {
            type: Sequelize.TEXT,
          },
          note: {
            type: Sequelize.TEXT,
          },
          approx_patients: {
            type: Sequelize.INTEGER,
          },
          is_active: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
          },
          is_mci: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
          },
          lat: {
            type: Sequelize.STRING,
          },
          lng: {
            type: Sequelize.STRING,
          },
          geog: {
            type: Sequelize.GEOMETRY,
          },
          address1: {
            type: Sequelize.STRING,
          },
          address2: {
            type: Sequelize.STRING,
          },
          city_id: {
            type: Sequelize.STRING,
          },
          county_id: {
            type: Sequelize.STRING,
          },
          state_id: {
            type: Sequelize.STRING,
          },
          zip: {
            type: Sequelize.STRING,
          },
          created_by_id: {
            allowNull: false,
            type: Sequelize.UUID,
          },
          updated_by_id: {
            allowNull: false,
            type: Sequelize.UUID,
          },
          created_by_agency_id: {
            allowNull: false,
            type: Sequelize.UUID,
          },
          updated_by_agency_id: {
            allowNull: false,
            type: Sequelize.UUID,
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
      );
      await queryInterface.sequelize.query(
        'CREATE INDEX scenes_geog_idx ON scenes USING gist(geog)',
        { transaction }
      );
      await queryInterface.addConstraint('scenes', {
        type: 'FOREIGN KEY',
        fields: ['city_id'],
        references: {
          table: 'cities',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('scenes', {
        type: 'FOREIGN KEY',
        fields: ['county_id'],
        references: {
          table: 'counties',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('scenes', {
        type: 'FOREIGN KEY',
        fields: ['state_id'],
        references: {
          table: 'states',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('scenes', {
        type: 'FOREIGN KEY',
        fields: ['created_by_id'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('scenes', {
        type: 'FOREIGN KEY',
        fields: ['updated_by_id'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('scenes', {
        type: 'FOREIGN KEY',
        fields: ['created_by_agency_id'],
        references: {
          table: {
            schema: 'demographics',
            tableName: 'agencies',
          },
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('scenes', {
        type: 'FOREIGN KEY',
        fields: ['updated_by_agency_id'],
        references: {
          table: {
            schema: 'demographics',
            tableName: 'agencies',
          },
          field: 'id',
        },
        transaction,
      });
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('scenes');
  },
};
