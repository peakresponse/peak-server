module.exports = {
  async up(queryInterface, Sequelize) {
    // clean up some old naming leftovers
    await queryInterface.sequelize.query(
      'ALTER TABLE "configurations" RENAME CONSTRAINT "demographics.configurations_created_by_id_users_fk" TO "configurations_created_by_id_users_fk"',
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE "configurations" RENAME CONSTRAINT "demographics.configurations_updated_by_id_users_fk" TO "configurations_updated_by_id_users_fk"',
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE "configurations" RENAME CONSTRAINT "demographics.configurations_state_id_states_fk" TO "configurations_state_id_states_fk"',
    );
    // drop current uniqueness constraint, to be recreated after with draft support
    await queryInterface.sequelize.query(
      'ALTER TABLE "configurations" DROP CONSTRAINT "demographics.configurations_agency_id_state_id_uk"',
    );
    // drop redundant state_name column
    await queryInterface.removeColumn('configurations', 'state_name');
    // add missing columns
    await queryInterface.addColumn('configurations', 'validation_errors', {
      type: Sequelize.JSONB,
    });
    await queryInterface.addColumn('configurations', 'version_id', {
      type: Sequelize.UUID,
      references: {
        model: {
          tableName: 'versions',
        },
        key: 'id',
      },
    });
    await queryInterface.addColumn('configurations', 'is_draft', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    // recreate index that enforces one config per state per agency as a partial on non-drafts
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX configurations_agency_id_state_id_uk ON configurations (created_by_agency_id, state_id) WHERE is_draft=FALSE',
    );
    await queryInterface.addColumn('configurations', 'draft_parent_id', {
      type: Sequelize.UUID,
      references: {
        model: {
          tableName: 'configurations',
        },
        key: 'id',
      },
      unique: true,
    });
    await queryInterface.addColumn('configurations', 'archived_at', {
      type: Sequelize.DATE,
    });
  },

  async down(queryInterface, Sequelize) {
    // drop all the new columns (will also drop new indexes referencing them)
    await queryInterface.removeColumn('configurations', 'archived_at');
    await queryInterface.removeColumn('configurations', 'draft_parent_id');
    await queryInterface.removeColumn('configurations', 'is_draft');
    await queryInterface.removeColumn('configurations', 'version_id');
    await queryInterface.removeColumn('configurations', 'validation_errors');
    // re-create original indexes
    await queryInterface.addConstraint('configurations', {
      type: 'UNIQUE',
      fields: ['created_by_agency_id', 'state_id'],
    });
    // re-create state_name column
    await queryInterface.addColumn('configurations', 'state_name', { type: Sequelize.STRING });
    // re-name back to original
    await queryInterface.sequelize.query(
      'ALTER TABLE "configurations" RENAME CONSTRAINT "configurations_created_by_agency_id_state_id_uk" TO "demographics.configurations_agency_id_state_id_uk"',
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE "configurations" RENAME CONSTRAINT "configurations_state_id_states_fk" TO "demographics.configurations_state_id_states_fk"',
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE "configurations" RENAME CONSTRAINT "configurations_updated_by_id_users_fk" TO "demographics.configurations_updated_by_id_users_fk"',
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE "configurations" RENAME CONSTRAINT "configurations_created_by_id_users_fk" TO "demographics.configurations_created_by_id_users_fk"',
    );
  },
};
