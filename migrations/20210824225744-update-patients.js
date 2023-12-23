module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'patients',
        'canonical_id',
        {
          type: Sequelize.UUID,
          references: {
            model: {
              tableName: 'patients',
            },
            key: 'id',
          },
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'patients',
        'parent_id',
        {
          type: Sequelize.UUID,
          references: {
            model: {
              tableName: 'patients',
            },
            key: 'id',
          },
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'patients',
        'second_parent_id',
        {
          type: Sequelize.UUID,
          references: {
            model: {
              tableName: 'patients',
            },
            key: 'id',
          },
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'patients',
        'data',
        {
          type: Sequelize.JSONB,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'patients',
        'updated_attributes',
        {
          type: Sequelize.JSONB,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'patients',
        'updated_data_attributes',
        {
          type: Sequelize.JSONB,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'patients',
        'is_valid',
        {
          allowNull: false,
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'patients',
        'validation_errors',
        {
          type: Sequelize.JSONB,
        },
        { transaction },
      );
      await queryInterface.sequelize.query('ALTER TABLE patients ALTER COLUMN pin DROP NOT NULL', { transaction });
      await queryInterface.sequelize.query('ALTER TABLE patients ALTER COLUMN priority DROP NOT NULL', { transaction });
      await queryInterface.sequelize.query('ALTER TABLE patients ALTER COLUMN version DROP NOT NULL', { transaction });
      await queryInterface.removeConstraint('patients', 'patients_scene_id_pin_uk', { transaction });
      await queryInterface.sequelize.query(
        'CREATE UNIQUE INDEX patients_scene_id_pin_uk ON patients (scene_id, pin) WHERE canonical_id IS NULL',
        { transaction },
      );
      await queryInterface.addColumn(
        'patient_observations',
        'pin',
        {
          type: Sequelize.CITEXT,
        },
        { transaction },
      );
      await queryInterface.sequelize.query(
        'UPDATE patient_observations SET pin=patients.pin FROM patients WHERE patients.id=patient_observations.patient_id',
        { transaction },
      );
      await queryInterface.sequelize.query(
        'INSERT INTO patients(id, canonical_id, pin, version, last_name, first_name, age, dob, respiratory_rate, pulse, capillary_refill, text, priority, location, lat, lng, created_at, created_by_id, updated_at, updated_by_id, updated_attributes, transport_agency_id, transport_facility_id, scene_id, parent_id, created_by_agency_id, updated_by_agency_id, portrait_file, photo_file, audio_file, geog, gender, age_units, bp_systolic, bp_diastolic, gcs_total, complaint, predictions, is_transported, is_transported_left_independently, triage_mental_status, triage_perfusion) SELECT id, patient_id AS canonical_id, pin, version, last_name, first_name, age, dob, respiratory_rate, pulse, capillary_refill, text, priority, location, lat, lng, created_at, created_by_id, updated_at, updated_by_id, updated_attributes, transport_agency_id, transport_facility_id, scene_id, parent_patient_observation_id AS parent_id, created_by_agency_id, updated_by_agency_id, portrait_file, photo_file, audio_file, geog, gender, age_units, bp_systolic, bp_diastolic, gcs_total, complaint, predictions, is_transported, is_transported_left_independently, triage_mental_status, triage_perfusion FROM patient_observations',
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query('DELETE FROM patients WHERE canonical_id IS NOT NULL', { transaction });
      await queryInterface.removeColumn('patient_observations', 'pin', { transaction });
      await queryInterface.removeIndex('patients', 'patients_scene_id_pin_uk', { transaction });
      await queryInterface.addConstraint('patients', {
        fields: ['scene_id', 'pin'],
        type: 'unique',
        name: 'patients_scene_id_pin_uk',
        transaction,
      });
      await queryInterface.sequelize.query('ALTER TABLE patients ALTER COLUMN version SET NOT NULL', { transaction });
      await queryInterface.sequelize.query('ALTER TABLE patients ALTER COLUMN priority SET NOT NULL', { transaction });
      await queryInterface.sequelize.query('ALTER TABLE patients ALTER COLUMN pin SET NOT NULL', { transaction });
      await queryInterface.removeColumn('patients', 'validation_errors', { transaction });
      await queryInterface.removeColumn('patients', 'is_valid', { transaction });
      await queryInterface.removeColumn('patients', 'updated_data_attributes', { transaction });
      await queryInterface.removeColumn('patients', 'updated_attributes', { transaction });
      await queryInterface.removeColumn('patients', 'data', { transaction });
      await queryInterface.removeColumn('patients', 'second_parent_id', { transaction });
      await queryInterface.removeColumn('patients', 'parent_id', { transaction });
      await queryInterface.removeColumn('patients', 'canonical_id', { transaction });
    });
  },
};
