module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'facilities',
        {
          id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: Sequelize.literal('gen_random_uuid()'),
          },
          agency_id: {
            allowNull: false,
            type: Sequelize.UUID,
          },
          facility_id: {
            type: Sequelize.UUID,
          },
          type: {
            type: Sequelize.STRING,
          },
          name: {
            type: Sequelize.STRING,
          },
          location_code: {
            type: Sequelize.STRING,
          },
          primary_designation: {
            type: Sequelize.STRING,
          },
          primary_national_provider_id: {
            type: Sequelize.STRING,
          },
          address: {
            type: Sequelize.STRING,
          },
          city_id: {
            type: Sequelize.STRING,
          },
          city_name: {
            type: Sequelize.STRING,
          },
          state_id: {
            type: Sequelize.STRING,
          },
          state_name: {
            type: Sequelize.STRING,
          },
          zip: {
            type: Sequelize.STRING,
          },
          county_id: {
            type: Sequelize.STRING,
          },
          county_name: {
            type: Sequelize.STRING,
          },
          country: {
            type: Sequelize.STRING,
          },
          geog: {
            type: Sequelize.GEOMETRY,
          },
          primary_phone: {
            type: Sequelize.STRING,
          },
          data: {
            type: Sequelize.JSONB,
          },
          created_by_id: {
            allowNull: false,
            type: Sequelize.UUID,
          },
          updated_by_id: {
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
        { schema: 'demographics', transaction }
      );
      await queryInterface.sequelize.query(
        'CREATE INDEX "demographics.facilities_geog_idx" ON demographics.facilities USING gist(geog)',
        { transaction }
      );
      await queryInterface.addConstraint('demographics.facilities', {
        type: 'FOREIGN KEY',
        fields: ['agency_id'],
        name: 'demographics.facilities_agency_id_demographics.agencies_fk',
        references: {
          table: {
            schema: 'demographics',
            tableName: 'agencies',
          },
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('demographics.facilities', {
        type: 'FOREIGN KEY',
        fields: ['facility_id'],
        references: {
          table: 'facilities',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('demographics.facilities', {
        type: 'FOREIGN KEY',
        fields: ['city_id'],
        references: {
          table: 'cities',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('demographics.facilities', {
        type: 'FOREIGN KEY',
        fields: ['county_id'],
        references: {
          table: 'counties',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('demographics.facilities', {
        type: 'FOREIGN KEY',
        fields: ['state_id'],
        references: {
          table: 'states',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('demographics.facilities', {
        type: 'FOREIGN KEY',
        fields: ['created_by_id'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('demographics.facilities', {
        type: 'FOREIGN KEY',
        fields: ['updated_by_id'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('demographics.facilities', {
        type: 'UNIQUE',
        fields: ['agency_id', 'state_id', 'location_code'],
        transaction,
      });
      await queryInterface.addConstraint('demographics.facilities', {
        type: 'UNIQUE',
        fields: ['agency_id', 'primary_national_provider_id'],
        transaction,
      });
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable(
        { schema: 'demographics', tableName: 'facilities' },
        { transaction }
      );
    });
  },
};
