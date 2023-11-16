const seedrandom = require('seedrandom');

const { Base } = require('./base');

const PatientPriority = {
  IMMEDIATE: 0,
  DELAYED: 1,
  MINIMAL: 2,
  EXPECTANT: 3,
  DECEASED: 4,
  TRANSPORTED: 5,
};
Object.freeze(PatientPriority);

module.exports = (sequelize, DataTypes) => {
  class Patient extends Base {
    static get Priority() {
      return PatientPriority;
    }

    static associate(models) {
      Patient.belongsTo(Patient, { as: 'canonical' });
      Patient.belongsTo(Patient, { as: 'current' });
      Patient.belongsTo(Patient, { as: 'parent' });
      Patient.belongsTo(Patient, { as: 'secondParent' });
      Patient.belongsTo(models.User, { as: 'updatedBy' });
      Patient.belongsTo(models.User, { as: 'createdBy' });
      Patient.belongsTo(models.Agency, { as: 'updatedByAgency' });
      Patient.belongsTo(models.Agency, { as: 'createdByAgency' });

      Patient.belongsTo(models.Scene, { as: 'scene' });
      Patient.belongsTo(models.Agency, { as: 'transportAgency' });
      Patient.belongsTo(models.Facility, { as: 'transportFacility' });

      Patient.hasMany(Patient, { as: 'versions', foreignKey: 'canonicalId' });
    }

    static generatePIN(seed) {
      const rng = seedrandom(seed);
      let pin = '';
      for (let i = 0; i < 6; i += 1) {
        pin += Math.floor(rng() * 10);
      }
      return pin;
    }

    static async createOrUpdate(user, agency, data, options) {
      if (!options?.transaction) {
        return sequelize.transaction((transaction) => Patient.createOrUpdate(user, agency, data, { ...options, transaction }));
      }
      const [record, created] = await Base.createOrUpdate(
        Patient,
        user,
        agency,
        data,
        ['pin'],
        [
          'lastName',
          'firstName',
          'gender',
          'age',
          'ageUnits',
          'dob',
          'complaint',
          'triageMentalStatus',
          'triagePerfusion',
          'respiratoryRate',
          'pulse',
          'capillaryRefill',
          'bpSystolic',
          'bpDiastolic',
          'gcsTotal',
          'text',
          'priority',
          'location',
          'lat',
          'lng',
          'geog',
          'portraitFile',
          'portraitUrl',
          'photoFile',
          'audioFile',
          'predictions',
          'isTransported',
          'isTransportedLeftIndependently',
          'transportAgencyId',
          'transportFacilityId',
          'data',
        ],
        options
      );
      return [record, created];
    }

    async toFullJSON(options) {
      const json = this.toJSON();
      json.transportAgency = (this.transportAgency || (await this.getTransportAgency(options)))?.toJSON();
      json.transportFacility = (this.transportFacility || (await this.getTransportFacility(options)))?.toJSON();
      json.versions = (this.versions || (await this.getVersions(options))).map((o) => o.toJSON());
      return json;
    }
  }

  Patient.init(
    {
      pin: DataTypes.STRING,
      lastName: {
        type: DataTypes.STRING,
        field: 'last_name',
      },
      firstName: {
        type: DataTypes.STRING,
        field: 'first_name',
      },
      gender: {
        type: DataTypes.STRING,
      },
      age: {
        type: DataTypes.INTEGER,
      },
      ageUnits: {
        type: DataTypes.STRING,
        field: 'age_units',
      },
      dob: {
        type: DataTypes.DATEONLY,
      },
      complaint: DataTypes.STRING,
      triageMentalStatus: {
        type: DataTypes.STRING,
        field: 'triage_mental_status',
      },
      triagePerfusion: {
        type: DataTypes.STRING,
        field: 'triage_perfusion',
      },
      respiratoryRate: {
        type: DataTypes.INTEGER,
        field: 'respiratory_rate',
      },
      pulse: DataTypes.INTEGER,
      capillaryRefill: {
        type: DataTypes.INTEGER,
        field: 'capillary_refill',
      },
      bpSystolic: {
        type: DataTypes.INTEGER,
        field: 'bp_systolic',
      },
      bpDiastolic: {
        type: DataTypes.INTEGER,
        field: 'bp_diastolic',
      },
      gcsTotal: {
        type: DataTypes.INTEGER,
        field: 'gcs_total',
      },
      text: DataTypes.TEXT,
      priority: DataTypes.INTEGER,
      filterPriority: {
        type: DataTypes.VIRTUAL(DataTypes.INTEGER),
        get() {
          return this.isTransported ? 5 : this.priority;
        },
      },
      location: DataTypes.TEXT,
      lat: DataTypes.STRING,
      lng: DataTypes.STRING,
      geog: DataTypes.GEOGRAPHY,
      portraitUrl: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.assetUrl('portraitFile');
        },
      },
      photoUrl: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.assetUrl('photoFile');
        },
      },
      audioUrl: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.assetUrl('audioFile');
        },
      },
      portraitFile: {
        type: DataTypes.STRING,
        field: 'portrait_file',
      },
      photoFile: {
        type: DataTypes.STRING,
        field: 'photo_file',
      },
      audioFile: {
        type: DataTypes.STRING,
        field: 'audio_file',
      },
      isTransported: {
        type: DataTypes.BOOLEAN,
        field: 'is_transported',
        set(value) {
          if (!value) {
            this.setDataValue('transportAgencyId', null);
            this.setDataValue('transportFacilityId', null);
            this.setDataValue('isTransportedLeftIndependently', false);
          }
          this.setDataValue('isTransported', value);
        },
      },
      isTransportedLeftIndependently: {
        type: DataTypes.BOOLEAN,
        field: 'is_transported_left_independently',
        set(value) {
          if (value) {
            this.setDataValue('transportAgencyId', null);
            this.setDataValue('transportFacilityId', null);
            this.setDataValue('isTransported', true);
          }
          this.setDataValue('isTransportedLeftIndependently', value);
        },
      },
      predictions: {
        type: DataTypes.JSONB,
      },
      data: DataTypes.JSONB,
      updatedAttributes: {
        type: DataTypes.JSONB,
        field: 'updated_attributes',
      },
      updatedDataAttributes: {
        type: DataTypes.JSONB,
        field: 'updated_data_attributes',
      },
      isValid: {
        type: DataTypes.BOOLEAN,
        field: 'is_valid',
      },
      validationErrors: {
        type: DataTypes.JSONB,
        field: 'validation_errors',
      },
    },
    {
      sequelize,
      modelName: 'Patient',
      tableName: 'patients',
      underscored: true,
      validate: {
        isTransportedValid() {
          if (this.isTransported) {
            if (this.isTransportedLeftIndependently && (this.transportAgencyId || this.transportFacilityId)) {
              throw new Error();
            } else if (!this.isTransportedLeftIndependently && (!this.transportAgencyId || !this.transportFacilityId)) {
              throw new Error();
            }
          } else if (this.transportAgencyId || this.transportFacilityId || this.isTransportedLeftIndependently) {
            throw new Error();
          }
        },
      },
    }
  );

  Patient.beforeValidate(async (record, options) => {
    record.syncFieldAndNemsisValue('lastName', ['ePatient.PatientNameGroup', 'ePatient.02'], options);
    record.syncFieldAndNemsisValue('firstName', ['ePatient.PatientNameGroup', 'ePatient.03'], options);
    record.syncFieldAndNemsisValue('gender', ['ePatient.13'], options);
    record.syncFieldAndNemsisValue('age', ['ePatient.AgeGroup', 'ePatient.15'], options);
    record.syncFieldAndNemsisValue('ageUnits', ['ePatient.AgeGroup', 'ePatient.16'], options);
    record.syncFieldAndNemsisValue('dob', ['ePatient.17'], options);
  });

  Patient.afterSave(async (patient, options) => {
    if (!patient.canonicalId) {
      return;
    }
    await patient.handleAssetFile('portraitFile', options);
    await patient.handleAssetFile('photoFile', options);
    await patient.handleAssetFile('audioFile', options);
  });

  Patient.addScope('canonical', {
    where: {
      canonicalId: null,
    },
  });

  return Patient;
};
