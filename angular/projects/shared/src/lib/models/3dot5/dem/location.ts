import { Base, NemsisValue } from '../../base';

export class Location extends Base {
  get description(): string {
    return `${this.name}`.trim();
  }

  get name(): NemsisValue {
    return this.getFirstNemsisValue(['dLocation.02']);
  }
}
