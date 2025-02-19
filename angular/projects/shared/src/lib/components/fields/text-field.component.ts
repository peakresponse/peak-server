import { Component, EventEmitter, Input, Output } from '@angular/core';

import { BaseFieldComponent } from './base-field.component';

@Component({
  selector: 'shared-text-field',
  templateUrl: './text-field.component.html',
  styles: [':host{display:block;}'],
  standalone: false,
})
export class TextFieldComponent extends BaseFieldComponent {
  @Input() type = 'text';
  @Input() rows = 1;
  @Input() isPlaintext = false;
  @Input('shared-debounced') debounceTime?: number;
  @Output() debouncedValueChange = new EventEmitter<string>();
}
