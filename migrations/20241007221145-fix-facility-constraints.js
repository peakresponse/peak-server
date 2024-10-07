/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeIndex('facilities', 'facilities_canonical_compound_uk');
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX facilities_canonical_compound_uk ON facilities (type, location_code, address, city_id, state_id) WHERE created_by_agency_id IS NULL AND is_draft=FALSE',
    );
    await queryInterface.removeIndex('facilities', 'facilities_canonical_primary_national_provider_id_uk');
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX facilities_canonical_primary_national_provider_id_uk ON facilities (primary_national_provider_id, state_id) WHERE created_by_agency_id IS NULL AND is_draft=FALSE',
    );
    await queryInterface.removeIndex('facilities', 'facilities_compound_uk');
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX facilities_compound_uk ON facilities (created_by_agency_id, type, location_code, address, city_id, state_id) WHERE created_by_agency_id IS NOT NULL AND is_draft=FALSE',
    );
    await queryInterface.removeIndex('facilities', 'facilities_primary_national_provider_id_uk');
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX facilities_primary_national_provider_id_uk ON facilities (created_by_agency_id, primary_national_provider_id) WHERE created_by_agency_id IS NOT NULL AND is_draft=FALSE',
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('facilities', 'facilities_canonical_compound_uk');
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX facilities_canonical_compound_uk ON facilities (type, location_code, address, city_id, state_id) WHERE canonical_facility_id IS NULL AND is_draft=FALSE',
    );
    await queryInterface.removeIndex('facilities', 'facilities_canonical_primary_national_provider_id_uk');
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX facilities_canonical_primary_national_provider_id_uk ON facilities (primary_national_provider_id, state_id) WHERE canonical_facility_id IS NULL AND is_draft=FALSE',
    );
    await queryInterface.removeIndex('facilities', 'facilities_compound_uk');
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX facilities_compound_uk ON facilities (created_by_agency_id, type, location_code, address, city_id, state_id) WHERE canonical_facility_id IS NOT NULL AND is_draft=FALSE',
    );
    await queryInterface.removeIndex('facilities', 'facilities_primary_national_provider_id_uk');
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX facilities_primary_national_provider_id_uk ON facilities (created_by_agency_id, primary_national_provider_id) WHERE canonical_facility_id IS NOT NULL AND is_draft=FALSE',
    );
  },
};
