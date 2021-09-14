module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('dispatches', 'current_id', {
      type: Sequelize.UUID,
      references: {
        model: 'dispatches',
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_DEFERRED,
      },
    });
    await queryInterface.addColumn('reports', 'current_id', {
      type: Sequelize.UUID,
      references: {
        model: 'reports',
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_DEFERRED,
      },
    });
    await queryInterface.addColumn('narratives', 'current_id', {
      type: Sequelize.UUID,
      references: {
        model: 'narratives',
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_DEFERRED,
      },
    });
    await queryInterface.addColumn('dispositions', 'current_id', {
      type: Sequelize.UUID,
      references: {
        model: 'dispositions',
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_DEFERRED,
      },
    });
    await queryInterface.addColumn('procedures', 'current_id', {
      type: Sequelize.UUID,
      references: {
        model: 'procedures',
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_DEFERRED,
      },
    });
    await queryInterface.addColumn('vitals', 'current_id', {
      type: Sequelize.UUID,
      references: {
        model: 'vitals',
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_DEFERRED,
      },
    });
    await queryInterface.addColumn('histories', 'current_id', {
      type: Sequelize.UUID,
      references: {
        model: 'histories',
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_DEFERRED,
      },
    });
    await queryInterface.addColumn('medications', 'current_id', {
      type: Sequelize.UUID,
      references: {
        model: 'medications',
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_DEFERRED,
      },
    });
    await queryInterface.addColumn('situations', 'current_id', {
      type: Sequelize.UUID,
      references: {
        model: 'situations',
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_DEFERRED,
      },
    });
    await queryInterface.addColumn('times', 'current_id', {
      type: Sequelize.UUID,
      references: {
        model: 'times',
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_DEFERRED,
      },
    });
    await queryInterface.addColumn('responses', 'current_id', {
      type: Sequelize.UUID,
      references: {
        model: 'responses',
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_DEFERRED,
      },
    });
    await queryInterface.addColumn('patients', 'current_id', {
      type: Sequelize.UUID,
      references: {
        model: 'patients',
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_DEFERRED,
      },
    });
    await queryInterface.addColumn('scenes', 'current_id', {
      type: Sequelize.UUID,
      references: {
        model: 'scenes',
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_DEFERRED,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('dispatches', 'current_id');
    await queryInterface.removeColumn('reports', 'current_id');
    await queryInterface.removeColumn('narratives', 'current_id');
    await queryInterface.removeColumn('dispositions', 'current_id');
    await queryInterface.removeColumn('procedures', 'current_id');
    await queryInterface.removeColumn('vitals', 'current_id');
    await queryInterface.removeColumn('histories', 'current_id');
    await queryInterface.removeColumn('medications', 'current_id');
    await queryInterface.removeColumn('situations', 'current_id');
    await queryInterface.removeColumn('times', 'current_id');
    await queryInterface.removeColumn('responses', 'current_id');
    await queryInterface.removeColumn('patients', 'current_id');
    await queryInterface.removeColumn('scenes', 'current_id');
  },
};
