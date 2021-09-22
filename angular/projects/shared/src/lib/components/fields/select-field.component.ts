import { Component, Input } from '@angular/core';

import { BaseFieldComponent } from './base-field.component';

@Component({
  selector: 'shared-select-field',
  templateUrl: './select-field.component.html',
  styles: ['.form-field::after { display: none }'],
})
export class SelectFieldComponent extends BaseFieldComponent {
  @Input() options: any = null;
  @Input() optionsKey: string = 'id';

  get optionValue(): string {
    if (this.options) {
      return this.value?.[this.optionsKey];
    } else {
      return this.value;
    }
  }

  set optionValue(value: string) {
    if (this.options) {
      this.value = this.options.find((obj: any) => obj[this.optionsKey] === value);
    } else {
      this.value = value;
    }
  }
}
