import { Base, NemsisValue } from '../../base';

export class Agency extends Base {
  get description(): string {
    return `${this.name}`;
  }

  get name(): NemsisValue {
    return this.getFirstNemsisValue(['dAgency.03']);
  }
}
