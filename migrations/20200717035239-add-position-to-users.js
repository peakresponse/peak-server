'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'position', {type: Sequelize.STRING, allowNull: false, defaultValue: ''});
    await queryInterface.sequelize.query('ALTER TABLE users ALTER COLUMN position DROP DEFAULT;');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'position');
  }
};
