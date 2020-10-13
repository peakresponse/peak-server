module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn('patients', 'scene_id', { type: Sequelize.UUID }, { transaction });
      await queryInterface.addColumn('patients', 'created_by_agency_id', { type: Sequelize.UUID }, { transaction });
      await queryInterface.addColumn('patients', 'updated_by_agency_id', { type: Sequelize.UUID }, { transaction });
      await queryInterface.addConstraint('patients', {
        type: 'FOREIGN KEY',
        fields: ['scene_id'],
        references: {
          table: 'scenes',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('patients', {
        type: 'FOREIGN KEY',
        fields: ['created_by_agency_id'],
        references: {
          table: {
            schema: 'demographics',
            tableName: 'agencies',
          },
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('patients', {
        type: 'FOREIGN KEY',
        fields: ['updated_by_agency_id'],
        references: {
          table: {
            schema: 'demographics',
            tableName: 'agencies',
          },
          field: 'id',
        },
        transaction,
      });

      await queryInterface.addColumn('observations', 'scene_id', { type: Sequelize.UUID }, { transaction });
      await queryInterface.addColumn('observations', 'parent_patient_observation_id', { type: Sequelize.UUID }, { transaction });
      await queryInterface.addColumn('observations', 'created_by_agency_id', { type: Sequelize.UUID }, { transaction });
      await queryInterface.addColumn('observations', 'updated_by_agency_id', { type: Sequelize.UUID }, { transaction });
      await queryInterface.addConstraint('observations', {
        type: 'FOREIGN KEY',
        fields: ['scene_id'],
        references: {
          table: 'scenes',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('observations', {
        type: 'FOREIGN KEY',
        fields: ['parent_patient_observation_id'],
        references: {
          table: 'observations',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('observations', {
        type: 'FOREIGN KEY',
        fields: ['created_by_agency_id'],
        references: {
          table: {
            schema: 'demographics',
            tableName: 'agencies',
          },
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('observations', {
        type: 'FOREIGN KEY',
        fields: ['updated_by_agency_id'],
        references: {
          table: {
            schema: 'demographics',
            tableName: 'agencies',
          },
          field: 'id',
        },
        transaction,
      });
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('patients', 'scene_id', {
        transaction,
      });
      await queryInterface.removeColumn('patients', 'created_by_agency_id', {
        transaction,
      });
      await queryInterface.removeColumn('patients', 'updated_by_agency_id', {
        transaction,
      });

      await queryInterface.removeColumn('observations', 'scene_id', {
        transaction,
      });
      await queryInterface.removeColumn('observations', 'parent_patient_observation_id', { transaction });
      await queryInterface.removeColumn('observations', 'created_by_agency_id', { transaction });
      await queryInterface.removeColumn('observations', 'updated_by_agency_id', { transaction });
    });
  },
};
