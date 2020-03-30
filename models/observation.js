'use strict';
module.exports = (sequelize, DataTypes) => {
  const Observation = sequelize.define('Observation', {
    version: DataTypes.INTEGER,
    lastName: {
      type: DataTypes.STRING,
      field: 'last_name'
    },
    firstName: {
      type: DataTypes.STRING,
      field: 'first_name'
    },
    age: DataTypes.INTEGER,
    dob: DataTypes.DATEONLY,
    respiratoryRate: {
      type: DataTypes.INTEGER,
      field: 'respiratory_rate'
    },
    pulse: DataTypes.INTEGER,
    capillaryRefill: {
      type: DataTypes.INTEGER,
      field: 'capillary_refill'
    },
    bloodPressure: {
      type: DataTypes.STRING,
      field: 'blood_pressure'
    },
    text: DataTypes.TEXT,
    priority: DataTypes.INTEGER,
    location: DataTypes.TEXT,
    lat: DataTypes.STRING,
    lng: DataTypes.STRING,
    portraitUrl: {
      type: DataTypes.TEXT,
      field: 'portrait_url'
    },
    photoUrl: {
      type: DataTypes.TEXT,
      field: 'photo_url'
    },
    audioUrl: {
      type: DataTypes.TEXT,
      field: 'audio_url'
    },
    updatedAttributes: {
      type: DataTypes.JSONB,
      field: 'updated_attributes'
    },
  }, {
    tableName: 'observations',
    underscored: true
  });
  Observation.prototype.toJSON = function() {
    let attributes = Object.assign({}, this.get());
    delete attributes.PatientId;
    return attributes;
  };
  Observation.associate = function(models) {
    // attributes which should only be system modified
    Observation.SYSTEM_ATTRIBUTES = ['pin', 'patientId', 'version', 'updatedAt', 'updatedById', 'createdAt', 'createdById', 'updatedAttributes'];
    // associations can be defined here
    Observation.belongsTo(models.Patient, {as: 'patient'});
    Observation.belongsTo(models.Transport, {as: 'transportMethod', foreignKeyId: 'transportMethodId'});
    Observation.belongsTo(models.Destination, {as: 'transportTo', foreignKeyId: 'transportToId'});
    Observation.belongsTo(models.User, {as: 'updatedBy'});
    Observation.belongsTo(models.User, {as: 'createdBy'});
  };
  return Observation;
};
