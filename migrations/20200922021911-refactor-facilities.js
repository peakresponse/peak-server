module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'facilities',
        'is_valid',
        { type: Sequelize.BOOLEAN, defaultValue: false, allowNull: false },
        { transaction },
      );

      await queryInterface.addColumn('facilities', 'canonical_facility_id', Sequelize.UUID, { transaction });
      await queryInterface.addConstraint('facilities', {
        type: 'FOREIGN KEY',
        fields: ['canonical_facility_id'],
        references: {
          table: 'facilities',
          field: 'id',
        },
        transaction,
      });

      await queryInterface.renameColumn('facilities', 'agency_id', 'created_by_agency_id', { transaction });
      await queryInterface.removeIndex('facilities', 'facilities_agency_id', {
        transaction,
      });

      await queryInterface.renameColumn('facilities', 'data_set', 'data', {
        transaction,
      });

      await queryInterface.renameColumn('facilities', 'state_code', 'state_id', { transaction });
      await queryInterface.addConstraint('facilities', {
        type: 'FOREIGN KEY',
        fields: ['state_id'],
        references: {
          table: 'states',
          field: 'id',
        },
        transaction,
      });

      await queryInterface.renameColumn('facilities', 'code', 'location_code', {
        transaction,
      });
      await queryInterface.renameColumn('facilities', 'city', 'city_name', {
        transaction,
      });
      await queryInterface.renameColumn('facilities', 'state', 'state_name', {
        transaction,
      });

      await queryInterface.addColumn('facilities', 'primary_designation', { type: Sequelize.STRING }, { transaction });
      await queryInterface.addColumn('facilities', 'primary_national_provider_id', { type: Sequelize.STRING }, { transaction });
      await queryInterface.addColumn('facilities', 'city_id', { type: Sequelize.STRING }, { transaction });
      await queryInterface.addConstraint('facilities', {
        type: 'FOREIGN KEY',
        fields: ['city_id'],
        references: {
          table: 'cities',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addColumn('facilities', 'county_id', { type: Sequelize.STRING }, { transaction });
      await queryInterface.addConstraint('facilities', {
        type: 'FOREIGN KEY',
        fields: ['county_id'],
        references: {
          table: 'counties',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addColumn('facilities', 'county_name', { type: Sequelize.STRING }, { transaction });
      await queryInterface.addColumn('facilities', 'primary_phone', { type: Sequelize.STRING }, { transaction });
      await queryInterface.addColumn('facilities', 'created_by_id', { type: Sequelize.UUID }, { transaction });
      await queryInterface.addConstraint('facilities', {
        type: 'FOREIGN KEY',
        fields: ['created_by_id'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addColumn('facilities', 'updated_by_id', { type: Sequelize.UUID }, { transaction });
      await queryInterface.addConstraint('facilities', {
        type: 'FOREIGN KEY',
        fields: ['updated_by_id'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction,
      });

      await queryInterface.removeIndex('facilities', 'facilities_state_code_code', { transaction });
      /// include the created by agency column in the compound unique ids
      await queryInterface.sequelize.query(
        'CREATE UNIQUE INDEX facilities_primary_national_provider_id_uk ON facilities (created_by_agency_id, primary_national_provider_id) WHERE created_by_agency_id IS NOT NULL',
        { transaction },
      );
      await queryInterface.sequelize.query(
        'CREATE UNIQUE INDEX facilities_compound_uk ON facilities (created_by_agency_id, type, location_code, address, city_id, state_id) WHERE created_by_agency_id IS NOT NULL',
        { transaction },
      );
      /// ensure there are compound unique ids for the canonical facility records on state
      await queryInterface.sequelize.query(
        'CREATE UNIQUE INDEX facilities_canonical_primary_national_provider_id_uk ON facilities (primary_national_provider_id, state_id) WHERE canonical_facility_id IS NULL',
        { transaction },
      );
      await queryInterface.sequelize.query(
        'CREATE UNIQUE INDEX facilities_canonical_compound_uk ON facilities (type, location_code, address, city_id, state_id) WHERE canonical_facility_id IS NULL',
        { transaction },
      );
      /// ensure facilities are either canonical or owned
      await queryInterface.addConstraint('facilities', {
        type: 'CHECK',
        fields: ['canonical_facility_id'],
        where: {
          [Sequelize.Op.or]: [
            {
              canonical_facility_id: { [Sequelize.Op.is]: null },
              created_by_agency_id: { [Sequelize.Op.is]: null },
            },
            {
              created_by_agency_id: { [Sequelize.Op.not]: null },
            },
          ],
        },
        transaction,
      });

      /// migrage demographics.facilities data
      await queryInterface.sequelize.query(
        `
        INSERT INTO facilities (id, created_by_agency_id, canonical_facility_id, type, name, location_code, primary_designation, primary_national_provider_id, address, city_id, city_name, state_id, state_name, zip, county_id, county_name, country, geog, primary_phone, data, created_by_id, updated_by_id, created_at, updated_at, is_valid)
        (SELECT id, agency_id, facility_id, type, name, location_code, primary_designation, primary_national_provider_id, address, city_id, city_name, state_id, state_name, zip, county_id, county_name, country, geog, primary_phone, data, created_by_id, updated_by_id, created_at, updated_at, is_valid FROM demographics.facilities);
      `,
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query('DELETE FROM facilities WHERE created_by_agency_id IS NOT NULL', { transaction });

      await queryInterface.removeColumn('facilities', 'is_valid', {
        transaction,
      });
      await queryInterface.removeColumn('facilities', 'canonical_facility_id', {
        transaction,
      });

      await queryInterface.renameColumn('facilities', 'created_by_agency_id', 'agency_id', { transaction });
      await queryInterface.addIndex('facilities', {
        fields: ['agency_id'],
        transaction,
      });

      await queryInterface.renameColumn('facilities', 'data', 'data_set', {
        transaction,
      });

      await queryInterface.removeConstraint('facilities', 'facilities_state_id_states_fk', { transaction });
      await queryInterface.renameColumn('facilities', 'state_id', 'state_code', { transaction });

      await queryInterface.renameColumn('facilities', 'location_code', 'code', {
        transaction,
      });
      await queryInterface.renameColumn('facilities', 'city_name', 'city', {
        transaction,
      });
      await queryInterface.renameColumn('facilities', 'state_name', 'state', {
        transaction,
      });

      await queryInterface.removeColumn('facilities', 'primary_designation', {
        transaction,
      });
      await queryInterface.removeColumn('facilities', 'primary_national_provider_id', { transaction });
      await queryInterface.removeColumn('facilities', 'city_id', {
        transaction,
      });
      await queryInterface.removeColumn('facilities', 'county_id', {
        transaction,
      });
      await queryInterface.removeColumn('facilities', 'county_name', {
        transaction,
      });
      await queryInterface.removeColumn('facilities', 'primary_phone', {
        transaction,
      });
      await queryInterface.removeColumn('facilities', 'created_by_id', {
        transaction,
      });
      await queryInterface.removeColumn('facilities', 'updated_by_id', {
        transaction,
      });
    });
  },
};
