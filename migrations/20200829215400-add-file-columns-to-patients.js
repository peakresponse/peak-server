module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('observations', 'portrait_url', {
        transaction,
      });
      await queryInterface.removeColumn('observations', 'photo_url', {
        transaction,
      });
      await queryInterface.removeColumn('observations', 'audio_url', {
        transaction,
      });
      await queryInterface.addColumn(
        'observations',
        'portrait_file',
        Sequelize.STRING,
        { transaction }
      );
      await queryInterface.addColumn(
        'observations',
        'photo_file',
        Sequelize.STRING,
        { transaction }
      );
      await queryInterface.addColumn(
        'observations',
        'audio_file',
        Sequelize.STRING,
        { transaction }
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('observations', 'portrait_file', {
        transaction,
      });
      await queryInterface.removeColumn('observations', 'photo_file', {
        transaction,
      });
      await queryInterface.removeColumn('observations', 'audio_file', {
        transaction,
      });
      await queryInterface.addColumn(
        'observations',
        'portrait_url',
        Sequelize.TEXT,
        { transaction }
      );
      await queryInterface.addColumn(
        'observations',
        'photo_url',
        Sequelize.TEXT,
        { transaction }
      );
      await queryInterface.addColumn(
        'observations',
        'audio_url',
        Sequelize.TEXT,
        { transaction }
      );
    });
  },
};
