module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('devices', 'version_id', {
      type: Sequelize.UUID,
      references: {
        model: {
          tableName: 'versions',
        },
        key: 'id',
      },
    });
    await queryInterface.sequelize.query(
      'ALTER TABLE "devices" RENAME CONSTRAINT "demographics.devices_created_by_id_users_fk" TO "devices_created_by_id_users_fk"'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE "devices" RENAME CONSTRAINT "demographics.devices_updated_by_id_users_fk" TO "devices_updated_by_id_users_fk"'
    );
    await queryInterface.sequelize.query('ALTER TABLE "devices" DROP CONSTRAINT "demographics.devices_agency_id_serial_number_uk"');
    await queryInterface.addColumn('devices', 'is_draft', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('devices', 'draft_parent_id', {
      type: Sequelize.UUID,
      references: {
        model: {
          tableName: 'devices',
        },
        key: 'id',
      },
      unique: true,
    });
    await queryInterface.addColumn('devices', 'validation_errors', {
      type: Sequelize.JSONB,
    });
    await queryInterface.addColumn('devices', 'archived_at', {
      type: Sequelize.DATE,
    });
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX devices_agency_id_serial_number_uk ON devices (created_by_agency_id, serial_number) WHERE is_draft=FALSE'
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('devices', 'archived_at');
    await queryInterface.removeColumn('devices', 'validation_errors');
    await queryInterface.removeColumn('devices', 'draft_parent_id');
    await queryInterface.removeColumn('devices', 'is_draft');
    await queryInterface.addConstraint('devices', {
      fields: ['created_by_agency_id', 'serial_number'],
      type: 'UNIQUE',
    });
    await queryInterface.sequelize.query(
      'ALTER TABLE "devices" RENAME CONSTRAINT "devices_created_by_agency_id_serial_number_uk" TO "demographics.devices_agency_id_serial_number_uk"'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE "devices" RENAME CONSTRAINT "devices_updated_by_id_users_fk" TO "demographics.devices_updated_by_id_users_fk"'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE "devices" RENAME CONSTRAINT "devices_created_by_id_users_fk" TO "demographics.devices_created_by_id_users_fk"'
    );
    await queryInterface.removeColumn('devices', 'version_id');
  },
};
