module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('contacts', 'version_id', {
      type: Sequelize.UUID,
      references: {
        model: {
          tableName: 'versions',
        },
        key: 'id',
      },
    });
    await queryInterface.sequelize.query(
      'ALTER TABLE "contacts" RENAME CONSTRAINT "demographics.contacts_created_by_id_users_fk" TO "contacts_created_by_id_users_fk"',
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE "contacts" RENAME CONSTRAINT "demographics.contacts_updated_by_id_users_fk" TO "contacts_updated_by_id_users_fk"',
    );
    await queryInterface.addColumn('contacts', 'is_draft', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('contacts', 'draft_parent_id', {
      type: Sequelize.UUID,
      references: {
        model: {
          tableName: 'contacts',
        },
        key: 'id',
      },
      unique: true,
    });
    await queryInterface.addColumn('contacts', 'validation_errors', {
      type: Sequelize.JSONB,
    });
    await queryInterface.addColumn('contacts', 'archived_at', {
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
    await queryInterface.removeColumn('contacts', 'archived_at');
    await queryInterface.removeColumn('contacts', 'validation_errors');
    await queryInterface.removeColumn('contacts', 'draft_parent_id');
    await queryInterface.removeColumn('contacts', 'is_draft');
    await queryInterface.sequelize.query(
      'ALTER TABLE "contacts" RENAME CONSTRAINT "contacts_updated_by_id_users_fk" TO "demographics.contacts_updated_by_id_users_fk"',
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE "contacts" RENAME CONSTRAINT "contacts_created_by_id_users_fk" TO "demographics.contacts_created_by_id_users_fk"',
    );
    await queryInterface.removeColumn('contacts', 'version_id');
  },
};
