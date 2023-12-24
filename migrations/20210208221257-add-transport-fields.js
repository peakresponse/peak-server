module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('patients', 'is_transported', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('patients', 'is_transported_left_independently', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('patient_observations', 'is_transported', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('patient_observations', 'is_transported_left_independently', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.sequelize.query(
      `UPDATE patients SET is_transported_left_independently=TRUE WHERE priority=5 AND transport_agency_id IS NULL AND transport_facility_id IS NULL`,
    );
    await queryInterface.sequelize.query(`UPDATE patients SET is_transported=TRUE WHERE priority=5`);
    await queryInterface.sequelize.query(
      `UPDATE patient_observations SET is_transported_left_independently=TRUE WHERE priority=5 AND transport_agency_id IS NULL AND transport_facility_id IS NULL`,
    );
    await queryInterface.sequelize.query(`UPDATE patient_observations SET is_transported=TRUE WHERE priority=5`);
    await queryInterface.sequelize.query(`
      UPDATE patients
      SET priority=sq.priority
      FROM (
        SELECT DISTINCT ON (patient_id) patient_id, priority
        FROM patient_observations
        WHERE priority < 5
        ORDER BY patient_id, created_at DESC
      ) AS sq
      WHERE patients.priority=5 AND patients.id=sq.patient_id`);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`UPDATE patients SET priority=5 WHERE is_transported=TRUE`);
    await queryInterface.removeColumn('patient_observations', 'is_transported_left_independently');
    await queryInterface.removeColumn('patient_observations', 'is_transported');
    await queryInterface.removeColumn('patients', 'is_transported_left_independently');
    await queryInterface.removeColumn('patients', 'is_transported');
  },
};
