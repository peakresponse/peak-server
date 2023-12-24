module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.sequelize.query(
      'ALTER TABLE "vehicles" RENAME CONSTRAINT "demographics.vehicles_created_by_id_users_fk" TO "vehicles_created_by_id_users_fk"',
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE "vehicles" RENAME CONSTRAINT "demographics.vehicles_updated_by_id_users_fk" TO "vehicles_updated_by_id_users_fk"',
    );
    await queryInterface.sequelize.query('ALTER TABLE "vehicles" DROP CONSTRAINT "demographics.vehicles_agency_id_vin_uk"');
    await queryInterface.sequelize.query('ALTER TABLE "vehicles" DROP CONSTRAINT "demographics.vehicles_agency_id_number_uk"');
    await queryInterface.addColumn('vehicles', 'is_draft', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('vehicles', 'draft_parent_id', {
      type: Sequelize.UUID,
      references: {
        model: {
          tableName: 'vehicles',
        },
        key: 'id',
      },
      unique: true,
    });
    await queryInterface.addColumn('vehicles', 'validation_errors', {
      type: Sequelize.JSONB,
    });
    await queryInterface.addColumn('vehicles', 'archived_at', {
      type: Sequelize.DATE,
    });
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX vehicles_agency_id_vin_uk ON vehicles (created_by_agency_id, vin) WHERE is_draft=FALSE',
    );
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX vehicles_agency_id_number_uk ON vehicles (created_by_agency_id, number) WHERE is_draft=FALSE',
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('vehicles', 'archived_at');
    await queryInterface.removeColumn('vehicles', 'validation_errors');
    await queryInterface.removeColumn('vehicles', 'draft_parent_id');
    await queryInterface.removeColumn('vehicles', 'is_draft');
    await queryInterface.addConstraint('vehicles', {
      type: 'UNIQUE',
      fields: ['created_by_agency_id', 'number'],
    });
    await queryInterface.addConstraint('vehicles', {
      type: 'UNIQUE',
      fields: ['created_by_agency_id', 'vin'],
    });
    await queryInterface.sequelize.query(
      'ALTER TABLE "vehicles" RENAME CONSTRAINT "vehicles_created_by_agency_id_vin_uk" TO "demographics.vehicles_agency_id_vin_uk"',
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE "vehicles" RENAME CONSTRAINT "vehicles_created_by_agency_id_number_uk" TO "demographics.vehicles_agency_id_number_uk"',
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE "vehicles" RENAME CONSTRAINT "vehicles_updated_by_id_users_fk" TO "demographics.vehicles_updated_by_id_users_fk"',
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE "vehicles" RENAME CONSTRAINT "vehicles_created_by_id_users_fk" TO "demographics.vehicles_created_by_id_users_fk"',
    );
  },
};
