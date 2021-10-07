import { Component, Input } from '@angular/core';

import { BaseFieldComponent } from './base-field.component';

@Component({
  selector: 'shared-checkbox',
  templateUrl: './checkbox.component.html',
})
export class CheckboxComponent extends BaseFieldComponent {
  @Input() inline = false;

  onClick(event: MouseEvent) {
    if (this.isReadOnly) {
      event.preventDefault();
    }
  }
}
