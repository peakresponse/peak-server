import { Base, NemsisValue } from './base';

export class File extends Base {
  get file(): NemsisValue {
    return this.getFirstNemsisValue(['eOther.22']);
  }

  get externalElectronicDocumentType(): NemsisValue {
    return this.getFirstNemsisValue(['eOther.09']);
  }

  get fileAttachmentType(): NemsisValue {
    return this.getFirstNemsisValue(['eOther.10']);
  }
}
