import { Component } from '@angular/core';

import { BaseFieldComponent } from './base-field.component';

@Component({
  selector: 'shared-field-select',
  templateUrl: './select-field.component.html',
  styleUrls: ['./select-field.component.scss'],
})
export class SelectFieldComponent extends BaseFieldComponent {}
