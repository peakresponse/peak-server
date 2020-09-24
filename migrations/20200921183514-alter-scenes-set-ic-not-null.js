module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(
        'ALTER TABLE scenes ALTER COLUMN incident_commander_id SET NOT NULL',
        { transaction }
      );
      await queryInterface.sequelize.query(
        'ALTER TABLE scenes ALTER COLUMN incident_commander_agency_id SET NOT NULL',
        { transaction }
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(
        'ALTER TABLE scenes ALTER COLUMN incident_commander_id DROP NOT NULL',
        { transaction }
      );
      await queryInterface.sequelize.query(
        'ALTER TABLE scenes ALTER COLUMN incident_commander_agency_id DROP NOT NULL',
        { transaction }
      );
    });
  },
};
