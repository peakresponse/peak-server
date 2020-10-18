module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn('patients', 'portrait_file', Sequelize.STRING, { transaction });
      await queryInterface.addColumn('patients', 'photo_file', Sequelize.STRING, { transaction });
      await queryInterface.addColumn('patients', 'audio_file', Sequelize.STRING, { transaction });
      await queryInterface.sequelize.query(
        `
        UPDATE patients
        SET portrait_file=SUBSTRING(portrait_url FROM 40),
        photo_file=SUBSTRING(photo_url FROM 37),
        audio_file=SUBSTRING(audio_url FROM 37)
      `,
        { transaction }
      );
      await queryInterface.removeColumn('patients', 'portrait_url', { transaction });
      await queryInterface.removeColumn('patients', 'photo_url', { transaction });
      await queryInterface.removeColumn('patients', 'audio_url', { transaction });
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn('patients', 'portrait_url', Sequelize.TEXT, { transaction });
      await queryInterface.addColumn('patients', 'photo_url', Sequelize.TEXT, { transaction });
      await queryInterface.addColumn('patients', 'audio_url', Sequelize.TEXT, { transaction });
      await queryInterface.sequelize.query(
        `
        UPDATE patients
        SET portrait_url=CASE WHEN portrait_file IS NOT NULL THEN CONCAT('/uploads/patient-observations/portrait/', portrait_file) ELSE NULL END,
        photo_url=CASE WHEN photo_file IS NOT NULL THEN CONCAT('/uploads/patient-observations/photo/', photo_file) ELSE NULL END,
        audio_url=CASE WHEN audio_file IS NOT NULL THEN CONCAT('/uploads/patient-observations/audio/', audio_file) ELSE NULL END
      `,
        { transaction }
      );
      await queryInterface.removeColumn('patients', 'portrait_file', { transaction });
      await queryInterface.removeColumn('patients', 'photo_file', { transaction });
      await queryInterface.removeColumn('patients', 'audio_file', { transaction });
    });
  },
};
