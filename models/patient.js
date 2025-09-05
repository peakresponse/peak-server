const _ = require('lodash');

const { Base } = require('./base');

const PatientPriority = {
  IMMEDIATE: 0,
  DELAYED: 1,
  MINIMAL: 2,
  EXPECTANT: 3,
  DECEASED: 4,
  TRANSPORTED: 5,
  DELETED: 6,
};
Object.freeze(PatientPriority);

const NemsisPatientPriorities = ['2708001', '2708003', '2708005', '2708007', '2708009'];
Object.freeze(NemsisPatientPriorities);

module.exports = (sequelize, DataTypes) => {
  class Patient extends Base {
    static get xsdPath() {
      return 'ePatient_v3.xsd';
    }

    static get rootTag() {
      return 'ePatient';
    }

    static get Priority() {
      return PatientPriority;
    }

    static get NemsisPatientPriorities() {
      return NemsisPatientPriorities;
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
        options,
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
      lastName: DataTypes.STRING,
      firstName: DataTypes.STRING,
      name: {
        type: DataTypes.VIRTUAL(DataTypes.STRING, ['firstName', 'lastName']),
        get() {
          return `${this.firstName} ${this.lastName}`.trim();
        },
      },
      gender: DataTypes.STRING,
      age: DataTypes.INTEGER,
      ageUnits: DataTypes.STRING,
      dob: DataTypes.DATEONLY,
      complaint: DataTypes.STRING,
      triageMentalStatus: DataTypes.STRING,
      triagePerfusion: DataTypes.STRING,
      respiratoryRate: DataTypes.INTEGER,
      pulse: DataTypes.INTEGER,
      capillaryRefill: DataTypes.INTEGER,
      bpSystolic: DataTypes.INTEGER,
      bpDiastolic: DataTypes.INTEGER,
      gcsTotal: DataTypes.INTEGER,
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
      portraitFile: DataTypes.STRING,
      photoFile: DataTypes.STRING,
      audioFile: DataTypes.STRING,
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
      predictions: DataTypes.JSONB,
      data: DataTypes.JSONB,
      updatedAttributes: DataTypes.JSONB,
      updatedDataAttributes: DataTypes.JSONB,
      isValid: DataTypes.BOOLEAN,
      validationErrors: DataTypes.JSONB,
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
    },
  );

  Patient.beforeValidate(async (record, options) => {
    record.syncFieldAndNemsisValue('lastName', ['ePatient.PatientNameGroup', 'ePatient.02'], options);
    record.syncFieldAndNemsisValue('firstName', ['ePatient.PatientNameGroup', 'ePatient.03'], options);
    record.syncFieldAndNemsisValue('gender', ['ePatient.13'], options, true);
    record.syncFieldAndNemsisValue('age', ['ePatient.AgeGroup', 'ePatient.15'], options, true);
    record.syncFieldAndNemsisValue('ageUnits', ['ePatient.AgeGroup', 'ePatient.16'], options, true);
    record.syncFieldAndNemsisValue('dob', ['ePatient.17'], options);
    // placeholders for required ePatient fields
    [['ePatient.07'], ['ePatient.08'], ['ePatient.09'], ['ePatient.14']].forEach((e) => {
      if (!_.get(record.data, [e])) {
        _.set(record.data, [e], {
          _attributes: {
            NV: '7701003',
            'xsi:nil': 'true',
          },
        });
        record.changed('data', true);
        options.fields = options.fields || [];
        if (options.fields.indexOf('data') < 0) {
          options.fields.push('data');
        }
      }
    });
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
