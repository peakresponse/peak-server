module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('locations', 'version_id', {
      type: Sequelize.UUID,
      references: {
        model: {
          tableName: 'versions',
        },
        key: 'id',
      },
    });
    await queryInterface.sequelize.query('ALTER INDEX "demographics.locations_geog_idx" RENAME TO "locations_geog_idx"');
    await queryInterface.sequelize.query(
      'ALTER TABLE "locations" RENAME CONSTRAINT "demographics.locations_created_by_id_users_fk" TO "locations_created_by_id_users_fk"'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE "locations" RENAME CONSTRAINT "demographics.locations_updated_by_id_users_fk" TO "locations_updated_by_id_users_fk"'
    );
    await queryInterface.addColumn('locations', 'is_draft', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('locations', 'draft_parent_id', {
      type: Sequelize.UUID,
      references: {
        model: {
          tableName: 'locations',
        },
        key: 'id',
      },
      unique: true,
    });
    await queryInterface.addColumn('locations', 'validation_errors', {
      type: Sequelize.JSONB,
    });
    await queryInterface.addColumn('locations', 'archived_at', {
      type: Sequelize.DATE,
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('locations', 'archived_at');
    await queryInterface.removeColumn('locations', 'validation_errors');
    await queryInterface.removeColumn('locations', 'draft_parent_id');
    await queryInterface.removeColumn('locations', 'is_draft');
    await queryInterface.sequelize.query(
      'ALTER TABLE "locations" RENAME CONSTRAINT "locations_updated_by_id_users_fk" TO "demographics.locations_updated_by_id_users_fk"'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE "locations" RENAME CONSTRAINT "locations_created_by_id_users_fk" TO "demographics.locations_created_by_id_users_fk"'
    );
    await queryInterface.sequelize.query('ALTER INDEX "locations_geog_idx" RENAME TO "demographics.locations_geog_idx"');
    await queryInterface.removeColumn('locations', 'version_id');
  },
};
