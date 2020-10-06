import { Component, Input } from '@angular/core';

import { BaseFieldComponent } from './base-field.component';

@Component({
  selector: 'shared-field-input',
  templateUrl: './input-field.component.html',
  styles: [':host{display:block;}'],
})
export class InputFieldComponent extends BaseFieldComponent {
  @Input() type = 'text';
}
