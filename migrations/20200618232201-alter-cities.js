'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async transaction => {
      /// drop the primary key on cities
      await queryInterface.removeColumn('cities', 'id', {transaction});
      /// rename the feature id to id
      await queryInterface.renameColumn('cities', 'feature_id', 'id', {transaction});
      /// make it the new primary key
      await queryInterface.addConstraint('cities', {type: 'PRIMARY KEY', fields: ['id'], transaction});
      /// remove the now-redundant unique index
      await queryInterface.removeIndex('cities', 'cities_feature_id', {transaction});
    });
  },
  down: async (queryInterface, Sequelize) => {
  }
};
