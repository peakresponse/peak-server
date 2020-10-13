/* eslint-disable no-await-in-loop */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn('patients', 'gender', { type: Sequelize.STRING }, { transaction });
      await queryInterface.addColumn('patients', 'age_units', { type: Sequelize.STRING }, { transaction });
      await queryInterface.addColumn('patients', 'bp_systolic', { type: Sequelize.INTEGER }, { transaction });
      await queryInterface.addColumn('patients', 'bp_diastolic', { type: Sequelize.INTEGER }, { transaction });
      await queryInterface.addColumn('patients', 'gcs_total', { type: Sequelize.INTEGER }, { transaction });
      await queryInterface.addColumn('patient_observations', 'gender', { type: Sequelize.STRING }, { transaction });
      await queryInterface.addColumn('patient_observations', 'age_units', { type: Sequelize.STRING }, { transaction });
      await queryInterface.addColumn('patient_observations', 'bp_systolic', { type: Sequelize.INTEGER }, { transaction });
      await queryInterface.addColumn('patient_observations', 'bp_diastolic', { type: Sequelize.INTEGER }, { transaction });
      await queryInterface.addColumn('patient_observations', 'gcs_total', { type: Sequelize.INTEGER }, { transaction });
      for (const table of ['patients', 'patient_observations']) {
        const [results] = await queryInterface.sequelize.query(`SELECT id, blood_pressure FROM ${table}`, { transaction });
        for (const result of results) {
          const m = result.blood_pressure?.match(/(\d+)\/(\d+)/);
          if (m) {
            const m1 = parseInt(m[1], 10);
            const m2 = parseInt(m[2], 10);
            if (m1 > m2) {
              await queryInterface.sequelize.query(`UPDATE ${table} SET bp_systolic=${m1}, bp_diastolic=${m2} WHERE id='${result.id}'`, {
                transaction,
              });
            } else {
              await queryInterface.sequelize.query(`UPDATE ${table} SET bp_systolic=${m2}, bp_diastolic=${m1} WHERE id='${result.id}'`, {
                transaction,
              });
            }
          }
        }
      }
      const [
        results,
      ] = await queryInterface.sequelize.query(
        `SELECT id, updated_attributes FROM patient_observations WHERE updated_attributes ? 'bloodPressure'`,
        { transaction }
      );
      for (const result of results) {
        const index = result.updated_attributes.indexOf('bloodPressure');
        result.updated_attributes.splice(index, 1, 'bpSystolic', 'bpDiastolic');
        await queryInterface.sequelize.query(
          `UPDATE patient_observations SET updated_attributes='${JSON.stringify(result.updated_attributes)}' WHERE id='${result.id}'`,
          { transaction }
        );
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('patients', 'gender', { transaction });
      await queryInterface.removeColumn('patients', 'age_units', {
        transaction,
      });
      await queryInterface.removeColumn('patients', 'bp_systolic', {
        transaction,
      });
      await queryInterface.removeColumn('patients', 'bp_diastolic', {
        transaction,
      });
      await queryInterface.removeColumn('patients', 'gcs_total', {
        transaction,
      });
      await queryInterface.removeColumn('patient_observations', 'gender', {
        transaction,
      });
      await queryInterface.removeColumn('patient_observations', 'age_units', {
        transaction,
      });
      await queryInterface.removeColumn('patient_observations', 'bp_systolic', {
        transaction,
      });
      await queryInterface.removeColumn('patient_observations', 'bp_diastolic', { transaction });
      await queryInterface.removeColumn('patient_observations', 'gcs_total', {
        transaction,
      });
    });
  },
};
