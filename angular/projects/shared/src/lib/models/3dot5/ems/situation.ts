import { Base, NemsisValue, NemsisValueList } from './base';

export class Situation extends Base {
  get chiefComplaint(): NemsisValue {
    return this.getFirstNemsisValue(['eSituation.PatientComplaintGroup', 'eSituation.04']);
  }

  get primarySymptom(): NemsisValue {
    return this.getFirstNemsisValue(['eSituation.09']);
  }

  get otherAssociatedSymptoms(): NemsisValueList {
    return this.getNemsisValues(['eSituation.10']);
  }
}
