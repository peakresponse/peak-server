import { Base, NemsisValue } from './base';

export class Narrative extends Base {
  get text(): NemsisValue {
    return this.getFirstNemsisValue(['eNarrative', 'eNarrative.01']);
  }
}
