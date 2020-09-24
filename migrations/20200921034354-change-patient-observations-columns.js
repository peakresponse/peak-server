module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(
        'ALTER TABLE patients ALTER COLUMN scene_id SET NOT NULL',
        { transaction }
      );
      await queryInterface.sequelize.query(
        'ALTER TABLE patients ALTER COLUMN created_by_agency_id SET NOT NULL',
        { transaction }
      );
      await queryInterface.sequelize.query(
        'ALTER TABLE patients ALTER COLUMN updated_by_agency_id SET NOT NULL',
        { transaction }
      );
      await queryInterface.sequelize.query(
        'ALTER TABLE observations ALTER COLUMN scene_id SET NOT NULL',
        { transaction }
      );
      await queryInterface.sequelize.query(
        'ALTER TABLE observations ALTER COLUMN created_by_agency_id SET NOT NULL',
        { transaction }
      );
      await queryInterface.sequelize.query(
        'ALTER TABLE observations ALTER COLUMN updated_by_agency_id SET NOT NULL',
        { transaction }
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(
        'ALTER TABLE patients ALTER COLUMN scene_id DROP NOT NULL',
        { transaction }
      );
      await queryInterface.sequelize.query(
        'ALTER TABLE patients ALTER COLUMN created_by_agency_id DROP NOT NULL',
        { transaction }
      );
      await queryInterface.sequelize.query(
        'ALTER TABLE patients ALTER COLUMN updated_by_agency_id DROP NOT NULL',
        { transaction }
      );
      await queryInterface.sequelize.query(
        'ALTER TABLE observations ALTER COLUMN scene_id DROP NOT NULL',
        { transaction }
      );
      await queryInterface.sequelize.query(
        'ALTER TABLE observations ALTER COLUMN created_by_agency_id DROP NOT NULL',
        { transaction }
      );
      await queryInterface.sequelize.query(
        'ALTER TABLE observations ALTER COLUMN updated_by_agency_id DROP NOT NULL',
        { transaction }
      );
    });
  },
};
