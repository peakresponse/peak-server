const _ = require('lodash');
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
      Patient.belongsTo(models.Scene, { as: 'scene' });
      Patient.belongsTo(models.Agency, { as: 'transportAgency' });
      Patient.belongsTo(models.Facility, { as: 'transportFacility' });
      Patient.hasMany(models.PatientObservation, { as: 'observations' });

      Patient.belongsTo(models.User, { as: 'updatedBy' });
      Patient.belongsTo(models.User, { as: 'createdBy' });
      Patient.belongsTo(models.Agency, { as: 'updatedByAgency' });
      Patient.belongsTo(models.Agency, { as: 'createdByAgency' });
    }

    static generatePIN(seed) {
      const rng = seedrandom(seed);
      let pin = '';
      for (let i = 0; i < 6; i += 1) {
        pin += Math.floor(rng() * 10);
      }
      return pin;
    }

    static async createOrUpdate(user, agency, scene, initialData, options = {}) {
      /// confirm this is a responder on scene
      const responder = await sequelize.models.Responder.findOne({
        where: { sceneId: scene.id, userId: user.id, agencyId: agency.id },
        transaction: options?.transaction,
      });
      if (!responder) {
        throw new Error();
      }
      /// build the observation record
      const updatedAttributes = _.keys(initialData);
      _.pullAll(updatedAttributes, sequelize.models.PatientObservation.SYSTEM_ATTRIBUTES);
      const data = _.extend(_.pick(initialData, updatedAttributes), {
        sceneId: scene.id,
        pin: initialData.pin,
        version: initialData.version,
        createdById: user.id,
        updatedById: user.id,
        createdByAgencyId: agency.id,
        updatedByAgencyId: agency.id,
      });
      const observation = sequelize.models.PatientObservation.build(data);
      /// modify attributes for patient
      delete data.id;
      /// find or create patient record
      let patient;
      let created = false;
      if (data.patientId) {
        /// note: patient record must already exist if referenced by id
        patient = await Patient.findByPk(data.patientId, {
          rejectOnEmpty: true,
          transaction: options?.transaction,
        });
      } else if (data.sceneId && data.pin) {
        [patient, created] = await Patient.findOrCreate({
          where: { sceneId: data.sceneId, pin: data.pin },
          defaults: data,
          transaction: options?.transaction,
        });
      } else {
        throw new Error();
      }
      /// save the observation
      observation.patientId = patient.id;
      observation.updatedAttributes = updatedAttributes;
      await observation.save(options);
      /// update the patient, if not newly created
      if (!created) {
        if (observation.version > patient.version) {
          await patient.update(data, options);
        } else {
          // TODO: handle out-of-order observation merging...?
        }
      }
      /// update scene counts
      await scene.updatePatientCounts(options);
      return [patient, created];
    }

    async toFullJSON(options) {
      const json = this.toJSON();
      json.transportAgency = (this.transportAgency || (await this.getTransportAgency(options)))?.toJSON();
      json.transportFacility = (this.transportFacility || (await this.getTransportFacility(options)))?.toJSON();
      json.observations = (this.observations || (await this.getObservations(options))).map((o) => o.toJSON());
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
          return Base.assetUrl('patient-observations/portrait', this.portraitFile);
        },
      },
      photoUrl: {
        type: DataTypes.VIRTUAL,
        get() {
          return Base.assetUrl('patient-observations/photo', this.photoFile);
        },
      },
      audioUrl: {
        type: DataTypes.VIRTUAL,
        get() {
          return Base.assetUrl('patient-observations/audio', this.audioFile);
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
  return Patient;
};
