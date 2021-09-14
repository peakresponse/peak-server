module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('reports', 'incident_id', {
      type: Sequelize.UUID,
      references: {
        model: 'incidents',
        key: 'id',
      },
    });
    await queryInterface.addColumn('reports', 'response_id', {
      type: Sequelize.UUID,
      references: {
        model: 'responses',
        key: 'id',
      },
    });
    await queryInterface.addColumn('reports', 'scene_id', {
      type: Sequelize.UUID,
      references: {
        model: 'scenes',
        key: 'id',
      },
    });
    await queryInterface.addColumn('reports', 'time_id', {
      type: Sequelize.UUID,
      references: {
        model: 'times',
        key: 'id',
      },
    });
    await queryInterface.addColumn('reports', 'patient_id', {
      type: Sequelize.UUID,
      references: {
        model: 'patients',
        key: 'id',
      },
    });
    await queryInterface.addColumn('reports', 'situation_id', {
      type: Sequelize.UUID,
      references: {
        model: 'situations',
        key: 'id',
      },
    });
    await queryInterface.addColumn('reports', 'history_id', {
      type: Sequelize.UUID,
      references: {
        model: 'histories',
        key: 'id',
      },
    });
    await queryInterface.addColumn('reports', 'medication_ids', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
    });
    await queryInterface.addColumn('reports', 'vital_ids', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
    });
    await queryInterface.addColumn('reports', 'procedure_ids', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
    });
    await queryInterface.addColumn('reports', 'disposition_id', {
      type: Sequelize.UUID,
      references: {
        model: 'dispositions',
        key: 'id',
      },
    });
    await queryInterface.addColumn('reports', 'narrative_id', {
      type: Sequelize.UUID,
      references: {
        model: 'narratives',
        key: 'id',
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
    await queryInterface.removeColumn('reports', 'incident_id');
    await queryInterface.removeColumn('reports', 'response_id');
    await queryInterface.removeColumn('reports', 'scene_id');
    await queryInterface.removeColumn('reports', 'time_id');
    await queryInterface.removeColumn('reports', 'patient_id');
    await queryInterface.removeColumn('reports', 'situation_id');
    await queryInterface.removeColumn('reports', 'history_id');
    await queryInterface.removeColumn('reports', 'medication_ids');
    await queryInterface.removeColumn('reports', 'vital_ids');
    await queryInterface.removeColumn('reports', 'procedure_ids');
    await queryInterface.removeColumn('reports', 'disposition_id');
    await queryInterface.removeColumn('reports', 'narrative_id');
  },
};
