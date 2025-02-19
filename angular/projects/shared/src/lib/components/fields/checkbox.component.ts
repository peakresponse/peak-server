import { Component, Input } from '@angular/core';

import { BaseFieldComponent } from './base-field.component';

@Component({
  selector: 'shared-checkbox',
  templateUrl: './checkbox.component.html',
  standalone: false,
})
export class CheckboxComponent extends BaseFieldComponent {
  @Input() inline = false;
  @Input() checkboxValue: any;

  get value(): any {
    const value = super.value;
    if (this.checkboxValue) {
      return value === this.checkboxValue;
    }
    return value;
  }

  set value(value: any) {
    if (this.checkboxValue) {
      if (value) {
        super.value = this.checkboxValue;
      } else {
        super.value = null;
      }
      return;
    }
    super.value = value;
  }

  onClick(event: MouseEvent) {
    if (this.isReadOnly) {
      event.preventDefault();
    }
  }
}
