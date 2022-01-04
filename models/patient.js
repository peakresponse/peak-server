const seedrandom = require('seedrandom');
const uuid = require('uuid');

const { Base } = require('./base');
const nemsis = require('../lib/nemsis');

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
      // allow sceneId and pin as an alternative to canonicalId
      if (!data.canonicalId && data.sceneId && data.pin) {
        const canonical = await Patient.findOne({
          where: {
            canonicalId: null,
            sceneId: data.sceneId,
            pin: data.pin,
          },
          transaction: options.transaction,
        });
        data.canonicalId = canonical ? canonical.id : uuid.v4();
      }
      // for now, for backwards compatibility until Scene/Incident refactor...
      // get the scene for this patient
      let scene;
      if (data.sceneId) {
        scene = await sequelize.models.Scene.findByPk(data.sceneId, { rejectOnEmpty: true, transaction: options.transaction });
      } else if (data.parentId) {
        const parent = await Patient.findByPk(data.parentId, { rejectOnEmpty: true, transaction: options.transaction });
        scene = await parent.getScene(options);
      }
      if (scene) {
        // confirm this is a responder on scene
        const responder = await sequelize.models.Responder.findOne({
          where: { sceneId: scene.id, userId: user.id, agencyId: agency.id },
          transaction: options?.transaction,
        });
        if (!responder) {
          throw new Error();
        }
      }
      const [record, created] = await Base.createOrUpdate(
        Patient,
        user,
        agency,
        data,
        ['sceneId', 'pin'],
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
      await scene?.updatePatientCounts(options);
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
      version: DataTypes.INTEGER,
      lastName: {
        type: DataTypes.STRING,
        field: 'last_name',
      },
      firstName: {
        type: DataTypes.STRING,
        field: 'first_name',
      },
      gender: DataTypes.STRING,
      age: DataTypes.INTEGER,
      ageUnits: {
        type: DataTypes.STRING,
        field: 'age_units',
      },
      dob: DataTypes.DATEONLY,
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
          return Base.assetUrl('patients/portrait', this.portraitFile);
        },
      },
      photoUrl: {
        type: DataTypes.VIRTUAL,
        get() {
          return Base.assetUrl('patients/photo', this.photoFile);
        },
      },
      audioUrl: {
        type: DataTypes.VIRTUAL,
        get() {
          return Base.assetUrl('patients/audio', this.audioFile);
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
        async schema() {
          this.validationErrors = await nemsis.validateSchema('ePatient_v3.xsd', 'ePatient', null, this.data);
          this.isValid = this.validationErrors === null;
        },
      },
    }
  );

  Patient.afterSave(async (patient, options) => {
    if (!patient.canonicalId) {
      return;
    }
    if (patient.changed('portraitFile')) {
      await Base.handleAssetFile('patients/portrait', patient.previous('portraitFile'), patient.portraitFile, options);
    }
    if (patient.changed('photoFile')) {
      await Base.handleAssetFile('patients/photo', patient.previous('photoFile'), patient.photoFile, options);
    }
    if (patient.changed('audioFile')) {
      await Base.handleAssetFile('patients/audio', patient.previous('audioFile'), patient.audioFile, options);
    }
  });

  Patient.addScope('canonical', {
    where: {
      canonicalId: null,
      parentId: null,
    },
  });

  return Patient;
};
