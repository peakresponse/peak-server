const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class PatientObservation extends Base {
    static associate(models) {
      // attributes which should only be system modified
      PatientObservation.SYSTEM_ATTRIBUTES = [
        'sceneId',
        'pin',
        'patientId',
        'version',
        'updatedAt',
        'updatedById',
        'updatedByAgencyId',
        'createdAt',
        'createdById',
        'createdByAgencyId',
        'updatedAttributes',
      ];
      // associations can be defined here
      PatientObservation.belongsTo(models.Scene, { as: 'scene' });
      PatientObservation.belongsTo(models.PatientObservation, {
        as: 'parentPatientObservation',
      });
      PatientObservation.belongsTo(models.Patient, { as: 'patient' });
      PatientObservation.belongsTo(models.Agency, { as: 'transportAgency' });
      PatientObservation.belongsTo(models.Facility, {
        as: 'transportFacility',
      });

      PatientObservation.belongsTo(models.User, { as: 'updatedBy' });
      PatientObservation.belongsTo(models.User, { as: 'createdBy' });
      PatientObservation.belongsTo(models.Agency, { as: 'updatedByAgency' });
      PatientObservation.belongsTo(models.Agency, { as: 'createdByAgency' });
    }

    toJSON() {
      const attributes = { ...this.get() };
      delete attributes.PatientId;
      return attributes;
    }
  }
  PatientObservation.init(
    {
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
      ageUnits: DataTypes.STRING,
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
      bpSystolic: DataTypes.INTEGER,
      bpDiastolic: DataTypes.INTEGER,
      gcsTotal: DataTypes.INTEGER,
      text: DataTypes.TEXT,
      priority: DataTypes.INTEGER,
      location: DataTypes.TEXT,
      lat: DataTypes.STRING,
      lng: DataTypes.STRING,
      geog: DataTypes.GEOGRAPHY,
      portraitUrl: {
        type: DataTypes.VIRTUAL,
        get() {
          return Base.assetUrl(
            'patient-observations/portrait',
            this.portraitFile
          );
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
      updatedAttributes: {
        type: DataTypes.JSONB,
        field: 'updated_attributes',
      },
    },
    {
      sequelize,
      modelName: 'PatientObservation',
      tableName: 'patient_observations',
      underscored: true,
    }
  );
  PatientObservation.afterSave(async (observation, options) => {
    if (observation.changed('portraitFile')) {
      Base.handleAssetFile(
        'patient-observations/portrait',
        observation.previous('portraitFile'),
        observation.portraitFile,
        options
      );
    }
    if (observation.changed('photoFile')) {
      Base.handleAssetFile(
        'patient-observations/photo',
        observation.previous('photoFile'),
        observation.photoFile,
        options
      );
    }
    if (observation.changed('audioFile')) {
      Base.handleAssetFile(
        'patient-observations/audio',
        observation.previous('audioFile'),
        observation.audioFile,
        options
      );
    }
  });
  return PatientObservation;
};
