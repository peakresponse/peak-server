import { Base, NemsisValueList } from './base';

export class History extends Base {
  get medicationAllergies(): NemsisValueList {
    return this.getNemsisValues(['eHistory.06']);
  }

  get environmentalFoodAllergies(): NemsisValueList {
    return this.getNemsisValues(['eHistory.07']);
  }

  get medicalSurgicalHistory(): NemsisValueList {
    return this.getNemsisValues(['eHistory.08']);
  }
}
