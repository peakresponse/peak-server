module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('employments', 'version_id', {
      type: Sequelize.UUID,
      references: {
        model: {
          tableName: 'versions',
        },
        key: 'id',
      },
    });
    await queryInterface.sequelize.query('ALTER TABLE "employments" DROP CONSTRAINT "demographics.employments_agency_id_email_uk"');
    await queryInterface.sequelize.query('ALTER TABLE "employments" DROP CONSTRAINT "demographics.employments_invitation_code_uk"');
    await queryInterface.sequelize.query(
      'ALTER TABLE "employments" RENAME CONSTRAINT "demographics.employments_created_by_id_users_fk" TO "employments_created_by_id_users_fk"'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE "employments" RENAME CONSTRAINT "demographics.employments_updated_by_id_users_fk" TO "employments_updated_by_id_users_fk"'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE "employments" RENAME CONSTRAINT "demographics.employments_user_id_users_fk" TO "employments_user_id_users_fk"'
    );
    await queryInterface.addColumn('employments', 'is_draft', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('employments', 'draft_parent_id', {
      type: Sequelize.UUID,
      references: {
        model: {
          tableName: 'employments',
        },
        key: 'id',
      },
      unique: true,
    });
    await queryInterface.addColumn('employments', 'validation_errors', {
      type: Sequelize.JSONB,
    });
    await queryInterface.addColumn('employments', 'archived_at', {
      type: Sequelize.DATE,
    });
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX employments_agency_id_email_uk ON employments (agency_id, email) WHERE is_draft=FALSE'
    );
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX employments_invitation_code_uk ON employments (invitation_code) WHERE is_draft=FALSE'
    );
    await queryInterface.renameColumn('employments', 'agency_id', 'created_by_agency_id');
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.renameColumn('employments', 'created_by_agency_id', 'agency_id');
    await queryInterface.removeColumn('employments', 'archived_at');
    await queryInterface.removeColumn('employments', 'validation_errors');
    await queryInterface.removeColumn('employments', 'draft_parent_id');
    await queryInterface.removeColumn('employments', 'is_draft');
    await queryInterface.addConstraint('employments', {
      fields: ['agency_id', 'email'],
      type: 'UNIQUE',
    });
    await queryInterface.addConstraint('employments', {
      fields: ['invitation_code'],
      type: 'UNIQUE',
    });
    await queryInterface.sequelize.query(
      'ALTER TABLE "employments" RENAME CONSTRAINT "employments_agency_id_email_uk" TO "demographics.employments_agency_id_email_uk"'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE "employments" RENAME CONSTRAINT "employments_invitation_code_uk" TO "demographics.employments_invitation_code_uk"'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE "employments" RENAME CONSTRAINT "employments_user_id_users_fk" TO "demographics.employments_user_id_users_fk"'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE "employments" RENAME CONSTRAINT "employments_updated_by_id_users_fk" TO "demographics.employments_updated_by_id_users_fk"'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE "employments" RENAME CONSTRAINT "employments_created_by_id_users_fk" TO "demographics.employments_created_by_id_users_fk"'
    );
    await queryInterface.removeColumn('employments', 'version_id');
  },
};
