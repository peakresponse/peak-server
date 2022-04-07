import { Base, NemsisValue } from './base';

export class Medication extends Base {
  get medicationAdministeredAt(): NemsisValue {
    return this.getFirstNemsisValue(['eMedications.01']);
  }

  get administeredPrior(): NemsisValue {
    return this.getFirstNemsisValue(['eMedications.02']);
  }

  get medication(): NemsisValue {
    return this.getFirstNemsisValue(['eMedications.03']);
  }

  get responseToMedication(): NemsisValue {
    return this.getFirstNemsisValue(['eMedications.07']);
  }
}
