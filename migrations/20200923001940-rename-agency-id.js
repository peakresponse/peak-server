module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.renameColumn(
        'configurations',
        'agency_id',
        'created_by_agency_id',
        { transaction }
      );
      await queryInterface.renameColumn(
        'contacts',
        'agency_id',
        'created_by_agency_id',
        { transaction }
      );
      await queryInterface.renameColumn(
        'devices',
        'agency_id',
        'created_by_agency_id',
        { transaction }
      );
      await queryInterface.renameColumn(
        'locations',
        'agency_id',
        'created_by_agency_id',
        { transaction }
      );
      await queryInterface.renameColumn(
        'vehicles',
        'agency_id',
        'created_by_agency_id',
        { transaction }
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.renameColumn(
        'configurations',
        'created_by_agency_id',
        'agency_id',
        { transaction }
      );
      await queryInterface.renameColumn(
        'contacts',
        'created_by_agency_id',
        'agency_id',
        { transaction }
      );
      await queryInterface.renameColumn(
        'devices',
        'created_by_agency_id',
        'agency_id',
        { transaction }
      );
      await queryInterface.renameColumn(
        'locations',
        'created_by_agency_id',
        'agency_id',
        { transaction }
      );
      await queryInterface.renameColumn(
        'vehicles',
        'created_by_agency_id',
        'agency_id',
        { transaction }
      );
    });
  },
};
