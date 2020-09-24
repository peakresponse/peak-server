module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(
        'ALTER TABLE demographics.configurations SET SCHEMA public',
        { transaction }
      );
      await queryInterface.sequelize.query(
        'ALTER TABLE demographics.contacts SET SCHEMA public',
        { transaction }
      );
      await queryInterface.sequelize.query(
        'ALTER TABLE demographics.devices SET SCHEMA public',
        { transaction }
      );
      await queryInterface.sequelize.query(
        'ALTER TABLE demographics.employments SET SCHEMA public',
        { transaction }
      );
      await queryInterface.sequelize.query(
        'ALTER TYPE "enum_demographics.employments_roles" RENAME TO "enum_employments_roles"',
        { transaction }
      );
      await queryInterface.sequelize.query(
        'ALTER TABLE demographics.locations SET SCHEMA public',
        { transaction }
      );
      await queryInterface.sequelize.query(
        'ALTER TABLE demographics.vehicles SET SCHEMA public',
        { transaction }
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(
        'ALTER TABLE configurations SET SCHEMA demographics',
        { transaction }
      );
      await queryInterface.sequelize.query(
        'ALTER TABLE contacts SET SCHEMA demographics',
        { transaction }
      );
      await queryInterface.sequelize.query(
        'ALTER TABLE devices SET SCHEMA demographics',
        { transaction }
      );
      await queryInterface.sequelize.query(
        'ALTER TABLE employments SET SCHEMA demographics',
        { transaction }
      );
      await queryInterface.sequelize.query(
        'ALTER TYPE "enum_employments_roles" RENAME TO "enum_demographics.employments_roles"',
        { transaction }
      );
      await queryInterface.sequelize.query(
        'ALTER TABLE locations SET SCHEMA demographics',
        { transaction }
      );
      await queryInterface.sequelize.query(
        'ALTER TABLE vehicles SET SCHEMA demographics',
        { transaction }
      );
    });
  },
};
