module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('observations', 'transport_method_id', {
        transaction,
      });
      await queryInterface.removeColumn('observations', 'transport_to_id', {
        transaction,
      });
      await queryInterface.removeColumn('patients', 'transport_method_id', {
        transaction,
      });
      await queryInterface.removeColumn('patients', 'transport_to_id', {
        transaction,
      });
      await queryInterface.dropTable('transports', { transaction });
      await queryInterface.dropTable('destinations', { transaction });

      await queryInterface.addColumn(
        'observations',
        'transport_agency_id',
        {
          type: Sequelize.UUID,
          references: {
            model: { tableName: 'agencies' },
            key: 'id',
          },
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'observations',
        'transport_facility_id',
        {
          type: Sequelize.UUID,
          references: {
            model: { tableName: 'facilities' },
            key: 'id',
          },
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'patients',
        'transport_agency_id',
        {
          type: Sequelize.UUID,
          references: {
            model: { tableName: 'agencies' },
            key: 'id',
          },
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'patients',
        'transport_facility_id',
        {
          type: Sequelize.UUID,
          references: {
            model: { tableName: 'facilities' },
            key: 'id',
          },
        },
        { transaction }
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('observations', 'transport_agency_id', {
        transaction,
      });
      await queryInterface.removeColumn(
        'observations',
        'transport_facility_id',
        { transaction }
      );
      await queryInterface.removeColumn('patients', 'transport_agency_id', {
        transaction,
      });
      await queryInterface.removeColumn('patients', 'transport_facility_id', {
        transaction,
      });
    });
  },
};
