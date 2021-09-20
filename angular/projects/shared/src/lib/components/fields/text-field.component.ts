import { Component, Input } from '@angular/core';

import { BaseFieldComponent } from './base-field.component';

@Component({
  selector: 'shared-text-field',
  templateUrl: './text-field.component.html',
  styles: [':host{display:block;}'],
})
export class TextField extends BaseFieldComponent {
  @Input() type = 'text';
}
