'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.addColumn({schema: 'demographics', tableName: 'agencies'}, 'is_valid', {type: Sequelize.BOOLEAN, defaultValue: false}, {transaction});
      await queryInterface.addColumn({schema: 'demographics', tableName: 'configurations'}, 'is_valid', {type: Sequelize.BOOLEAN, defaultValue: false}, {transaction});
      await queryInterface.addColumn({schema: 'demographics', tableName: 'contacts'}, 'is_valid', {type: Sequelize.BOOLEAN, defaultValue: false}, {transaction});
      await queryInterface.addColumn({schema: 'demographics', tableName: 'devices'}, 'is_valid', {type: Sequelize.BOOLEAN, defaultValue: false}, {transaction});
      await queryInterface.addColumn({schema: 'demographics', tableName: 'employments'}, 'is_valid', {type: Sequelize.BOOLEAN, defaultValue: false}, {transaction});
      await queryInterface.addColumn({schema: 'demographics', tableName: 'facilities'}, 'is_valid', {type: Sequelize.BOOLEAN, defaultValue: false}, {transaction});
      await queryInterface.addColumn({schema: 'demographics', tableName: 'locations'}, 'is_valid', {type: Sequelize.BOOLEAN, defaultValue: false}, {transaction});
      await queryInterface.addColumn({schema: 'demographics', tableName: 'vehicles'}, 'is_valid', {type: Sequelize.BOOLEAN, defaultValue: false}, {transaction});
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.removeColumn({schema: 'demographics', tableName: 'vehicles'}, 'is_valid', {transaction});
      await queryInterface.removeColumn({schema: 'demographics', tableName: 'locations'}, 'is_valid', {transaction});
      await queryInterface.removeColumn({schema: 'demographics', tableName: 'facilities'}, 'is_valid', {transaction});
      await queryInterface.removeColumn({schema: 'demographics', tableName: 'employments'}, 'is_valid', {transaction});
      await queryInterface.removeColumn({schema: 'demographics', tableName: 'devices'}, 'is_valid', {transaction});
      await queryInterface.removeColumn({schema: 'demographics', tableName: 'contacts'}, 'is_valid', {transaction});
      await queryInterface.removeColumn({schema: 'demographics', tableName: 'configurations'}, 'is_valid', {transaction});
      await queryInterface.removeColumn({schema: 'demographics', tableName: 'agencies'}, 'is_valid', {transaction});
    });
  }
};
