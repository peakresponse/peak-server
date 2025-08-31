import { Base, NemsisValue } from './base';

export class Vital extends Base {
  get vitalSignsTakenAt(): NemsisValue {
    return this.getFirstNemsisValue(['eVitals.01']);
  }

  get obtainedPrior(): NemsisValue {
    return this.getFirstNemsisValue(['eVitals.02']);
  }

  get cardiacRhythm(): NemsisValue {
    return this.getFirstNemsisValue(['eVitals.CardiacRhythmGroup', 'eVitals.03']);
  }

  get bpSystolic(): NemsisValue {
    return this.getFirstNemsisValue(['eVitals.BloodPressureGroup', 'eVitals.06']);
  }

  get bpDiastolic(): NemsisValue {
    return this.getFirstNemsisValue(['eVitals.BloodPressureGroup', 'eVitals.07']);
  }

  get heartRate(): NemsisValue {
    return this.getFirstNemsisValue(['eVitals.HeartRateGroup', 'eVitals.10']);
  }

  get pulseOximetry(): NemsisValue {
    return this.getFirstNemsisValue(['eVitals.12']);
  }

  get respiratoryRate(): NemsisValue {
    return this.getFirstNemsisValue(['eVitals.14']);
  }

  get endTidalCarbonDioxide(): NemsisValue {
    return this.getFirstNemsisValue(['eVitals.16']);
  }

  get carbonMonoxide(): NemsisValue {
    return this.getFirstNemsisValue(['eVitals.17']);
  }

  get bloodGlucoseLevel(): NemsisValue {
    return this.getFirstNemsisValue(['eVitals.18']);
  }

  get totalGlasgowComaScore(): NemsisValue {
    return this.getFirstNemsisValue(['eVitals.GlasgowScoreGroup', 'eVitals.23']);
  }

  get temperatureC(): NemsisValue {
    return this.getFirstNemsisValue(['eVitals.TemperatureGroup', 'eVitals.24']);
  }
}
