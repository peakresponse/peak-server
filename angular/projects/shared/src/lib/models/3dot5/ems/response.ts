import { Base, NemsisValue } from './base';

export class Response extends Base {
  get incidentNumber(): NemsisValue {
    return this.getFirstNemsisValue(['eResponse.03']);
  }

  get unitNumber(): NemsisValue {
    return this.getFirstNemsisValue(['eResponse.13']);
  }
}
