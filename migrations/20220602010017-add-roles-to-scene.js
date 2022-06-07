module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'scenes',
        'mgs_responder_id',
        {
          type: Sequelize.UUID,
          references: {
            model: {
              tableName: 'responders',
            },
            key: 'id',
            deferrable: Sequelize.Deferrable.INITIALLY_DEFERRED,
          },
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'scenes',
        'triage_responder_id',
        {
          type: Sequelize.UUID,
          references: {
            model: {
              tableName: 'responders',
            },
            key: 'id',
            deferrable: Sequelize.Deferrable.INITIALLY_DEFERRED,
          },
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'scenes',
        'treatment_responder_id',
        {
          type: Sequelize.UUID,
          references: {
            model: {
              tableName: 'responders',
            },
            key: 'id',
            deferrable: Sequelize.Deferrable.INITIALLY_DEFERRED,
          },
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'scenes',
        'staging_responder_id',
        {
          type: Sequelize.UUID,
          references: {
            model: {
              tableName: 'responders',
            },
            key: 'id',
            deferrable: Sequelize.Deferrable.INITIALLY_DEFERRED,
          },
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'scenes',
        'transport_responder_id',
        {
          type: Sequelize.UUID,
          references: {
            model: {
              tableName: 'responders',
            },
            key: 'id',
            deferrable: Sequelize.Deferrable.INITIALLY_DEFERRED,
          },
        },
        { transaction }
      );
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('scenes', 'transport_responder_id', { transaction });
      await queryInterface.removeColumn('scenes', 'staging_responder_id', { transaction });
      await queryInterface.removeColumn('scenes', 'treatment_responder_id', { transaction });
      await queryInterface.removeColumn('scenes', 'triage_responder_id', { transaction });
      await queryInterface.removeColumn('scenes', 'mgs_responder_id', { transaction });
    });
  },
};
