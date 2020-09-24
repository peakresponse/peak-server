const addUserReference = async (
  queryInterface,
  tableName,
  column,
  transaction
) => {
  await queryInterface.addConstraint(tableName, {
    type: 'FOREIGN KEY',
    fields: [column],
    references: {
      table: 'users',
      field: 'id',
    },
    transaction,
  });
};

const addAgencyReference = async (
  queryInterface,
  tableName,
  column,
  transaction
) => {
  await queryInterface.addConstraint(tableName, {
    type: 'FOREIGN KEY',
    fields: [column],
    references: {
      table: {
        schema: 'demographics',
        tableName: 'agencies',
      },
      field: 'id',
    },
    transaction,
  });
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn('scenes', 'closed_at', Sequelize.DATE, {
        transaction,
      });
      await queryInterface.addColumn(
        'scenes',
        'incident_commander_id',
        Sequelize.UUID,
        { transaction }
      );
      await queryInterface.addColumn(
        'scenes',
        'incident_commander_agency_id',
        Sequelize.UUID,
        { transaction }
      );
      await queryInterface.addColumn(
        'scene_observations',
        'closed_at',
        Sequelize.DATE,
        { transaction }
      );
      await queryInterface.addColumn(
        'scene_observations',
        'incident_commander_id',
        Sequelize.UUID,
        { transaction }
      );
      await queryInterface.addColumn(
        'scene_observations',
        'incident_commander_agency_id',
        Sequelize.UUID,
        { transaction }
      );
      await addUserReference(
        queryInterface,
        'scenes',
        'incident_commander_id',
        transaction
      );
      await addAgencyReference(
        queryInterface,
        'scenes',
        'incident_commander_agency_id',
        transaction
      );
      await addUserReference(
        queryInterface,
        'scene_observations',
        'incident_commander_id',
        transaction
      );
      await addAgencyReference(
        queryInterface,
        'scene_observations',
        'incident_commander_agency_id',
        transaction
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('scenes', 'closed_at', { transaction });
      await queryInterface.removeColumn('scenes', 'incident_commander_id', {
        transaction,
      });
      await queryInterface.removeColumn(
        'scenes',
        'incident_commander_agency_id',
        { transaction }
      );
      await queryInterface.removeColumn('scene_observations', 'closed_at', {
        transaction,
      });
      await queryInterface.removeColumn(
        'scene_observations',
        'incident_commander_id',
        { transaction }
      );
      await queryInterface.removeColumn(
        'scene_observations',
        'incident_commander_agency_id',
        { transaction }
      );
    });
  },
};
