import { Base, NemsisValue } from '../../base';

export class Contact extends Base {
  get description(): string {
    return `${this.lastName}, ${this.firstName} ${this.middleName}`.trim();
  }

  get lastName(): NemsisValue {
    return this.getFirstNemsisValue(['dContact.02']);
  }

  get firstName(): NemsisValue {
    return this.getFirstNemsisValue(['dContact.03']);
  }

  get middleName(): NemsisValue {
    return this.getFirstNemsisValue(['dContact.04']);
  }
}
