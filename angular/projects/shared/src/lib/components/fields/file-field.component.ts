import { Component, EventEmitter, Input, Output } from '@angular/core';

import { BaseFieldComponent } from './base-field.component';

@Component({
  selector: 'shared-file-field',
  templateUrl: './file-field.component.html',
  styles: [':host{display:block;}'],
})
export class FileFieldComponent extends BaseFieldComponent {
  upload?: any;

  onClear() {
    super.onClear();
    this.upload = undefined;
  }

  onUploaded(upload: any) {
    this.upload = upload;
    this.value = upload.href;
  }
}
