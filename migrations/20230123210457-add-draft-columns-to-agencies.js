module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.removeIndex('agencies', 'agencies_subdomain_state_unique_id_number_state_id');
    await queryInterface.removeConstraint('agencies', 'agencies_created_by_agency_id_state_unique_id_number_state_id_u');
    await queryInterface.removeConstraint('agencies', 'agencies_subdomain_ck');
    await queryInterface.removeConstraint('agencies', 'agencies_subdomain_uk');
    await queryInterface.addColumn('agencies', 'validation_errors', {
      type: Sequelize.JSONB,
    });
    await queryInterface.addColumn('agencies', 'draft_parent_id', {
      type: Sequelize.UUID,
      references: {
        model: {
          tableName: 'agencies',
        },
        key: 'id',
      },
      unique: true,
    });
    await queryInterface.addColumn('agencies', 'is_draft', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.sequelize.query('CREATE UNIQUE INDEX agencies_subdomain ON agencies (subdomain) WHERE is_draft=FALSE');
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX agencies_created_by_agency_id_state_unique_id_number_state_id_u ON agencies (created_by_agency_id, state_unique_id, number, state_id) WHERE is_draft=FALSE'
    );
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX agencies_subdomain_state_unique_id_number_state_id ON agencies (state_unique_id, number, state_id) WHERE subdomain IS NOT NULL AND is_draft=FALSE'
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeIndex('agencies', 'agencies_subdomain_state_unique_id_number_state_id');
    await queryInterface.removeIndex('agencies', 'agencies_created_by_agency_id_state_unique_id_number_state_id_u');
    await queryInterface.removeIndex('agencies', 'agencies_subdomain');
    await queryInterface.removeColumn('agencies', 'is_draft');
    await queryInterface.removeColumn('agencies', 'draft_parent_id');
    await queryInterface.removeColumn('agencies', 'validation_errors');
    await queryInterface.addConstraint('agencies', {
      type: 'UNIQUE',
      fields: ['subdomain'],
    });
    await queryInterface.addConstraint('agencies', {
      type: 'CHECK',
      fields: ['subdomain'],
      where: {
        [Sequelize.Op.or]: [
          {
            subdomain: { [Sequelize.Op.is]: null },
            [Sequelize.Op.not]: {
              created_by_agency_id: { [Sequelize.Op.col]: 'id' },
            },
          },
          {
            subdomain: { [Sequelize.Op.not]: null },
            created_by_agency_id: { [Sequelize.Op.col]: 'id' },
          },
        ],
      },
    });
    await queryInterface.addConstraint('agencies', {
      type: 'UNIQUE',
      fields: ['created_by_agency_id', 'state_unique_id', 'number', 'state_id'],
    });
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX agencies_subdomain_state_unique_id_number_state_id ON agencies (state_unique_id, number, state_id) WHERE subdomain IS NOT NULL'
    );
  },
};
