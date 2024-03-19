import { Base, NemsisValue } from './base';

export class Time extends Base {
  get unitNotifiedByDispatch(): NemsisValue {
    return this.getFirstNemsisValue(['eTimes.03']);
  }

  get arrivedAtPatient(): NemsisValue {
    return this.getFirstNemsisValue(['eTimes.07']);
  }
}
