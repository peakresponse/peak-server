module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('facilities', 'version_id', {
      type: Sequelize.UUID,
      references: {
        model: {
          tableName: 'versions',
        },
        key: 'id',
      },
    });
    await queryInterface.sequelize.query('DROP INDEX "facilities_canonical_compound_uk"');
    await queryInterface.sequelize.query('DROP INDEX "facilities_canonical_primary_national_provider_id_uk"');
    await queryInterface.sequelize.query('DROP INDEX "facilities_compound_uk"');
    await queryInterface.sequelize.query('DROP INDEX "facilities_primary_national_provider_id_uk"');
    await queryInterface.addColumn('facilities', 'is_draft', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('facilities', 'draft_parent_id', {
      type: Sequelize.UUID,
      references: {
        model: {
          tableName: 'facilities',
        },
        key: 'id',
      },
      unique: true,
    });
    await queryInterface.addColumn('facilities', 'validation_errors', {
      type: Sequelize.JSONB,
    });
    await queryInterface.addColumn('facilities', 'archived_at', {
      type: Sequelize.DATE,
    });
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX facilities_canonical_compound_uk ON facilities (type, location_code, address, city_id, state_id) WHERE canonical_facility_id IS NULL AND is_draft=FALSE',
    );
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX facilities_canonical_primary_national_provider_id_uk ON facilities (primary_national_provider_id, state_id) WHERE canonical_facility_id IS NULL AND is_draft=FALSE',
    );
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX facilities_compound_uk ON facilities (created_by_agency_id, type, location_code, address, city_id, state_id) WHERE canonical_facility_id IS NOT NULL AND is_draft=FALSE',
    );
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX facilities_primary_national_provider_id_uk ON facilities (created_by_agency_id, primary_national_provider_id) WHERE canonical_facility_id IS NOT NULL AND is_draft=FALSE',
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('facilities', 'archived_at');
    await queryInterface.removeColumn('facilities', 'validation_errors');
    await queryInterface.removeColumn('facilities', 'draft_parent_id');
    await queryInterface.removeColumn('facilities', 'is_draft');
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX facilities_canonical_compound_uk ON facilities (type, location_code, address, city_id, state_id) WHERE canonical_facility_id IS NULL',
    );
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX facilities_canonical_primary_national_provider_id_uk ON facilities (primary_national_provider_id, state_id) WHERE canonical_facility_id IS NULL',
    );
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX facilities_compound_uk ON facilities (created_by_agency_id, type, location_code, address, city_id, state_id) WHERE canonical_facility_id IS NOT NULL',
    );
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX facilities_primary_national_provider_id_uk ON facilities (created_by_agency_id, primary_national_provider_id) WHERE canonical_facility_id IS NOT NULL',
    );
    await queryInterface.removeColumn('facilities', 'version_id');
  },
};
