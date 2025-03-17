import { Base, NemsisValue } from '../../base';

export class Employment extends Base {
  get description(): string {
    return `${this.lastName}, ${this.firstName} ${this.middleName}`.trim();
  }

  get lastName(): NemsisValue {
    return this.getFirstNemsisValue(['dPersonnel.NameGroup', 'dPersonnel.01']);
  }

  get firstName(): NemsisValue {
    return this.getFirstNemsisValue(['dPersonnel.NameGroup', 'dPersonnel.02']);
  }

  get middleName(): NemsisValue {
    return this.getFirstNemsisValue(['dPersonnel.NameGroup', 'dPersonnel.03']);
  }
}
