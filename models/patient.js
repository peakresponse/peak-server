'use strict';

const seedrandom = require('seedrandom');

module.exports = (sequelize, DataTypes) => {
  const Patient = sequelize.define('Patient', {
    pin: DataTypes.STRING,
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
    }
  }, {
    tableName: 'patients',
    underscored: true
  });
  Patient.associate = function(models) {
    // associations can be defined here
    Patient.belongsTo(models.Agency, {as: 'transportAgency'});
    Patient.belongsTo(models.Facility, {as: 'transportFacility'});
    Patient.belongsTo(models.User, {as: 'updatedBy'});
    Patient.belongsTo(models.User, {as: 'createdBy'});
    Patient.hasMany(models.Observation, {as: 'observations'});

    Patient.generatePIN = function(seed) {
      const rng = seedrandom(seed);
      let pin = '';
      for (let i = 0; i < 6; i++) {
        pin += Math.floor(rng() * 10);
      }
      return pin;
    }
  };
  return Patient;
};
