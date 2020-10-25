import { Component, Input } from '@angular/core';

import { BaseFieldComponent } from './base-field.component';

@Component({
  selector: 'shared-field-input-age',
  templateUrl: './input-age-field.component.html',
  styleUrls: ['./input-age-field.component.scss'],
})
export class InputAgeFieldComponent extends BaseFieldComponent {
  @Input() unitsPropertyName: string = null;

  get derivedUnitsPropertyName(): string {
    return this.unitsPropertyName || `${this.name || this.id}Units`;
  }

  get unitsValue(): string {
    return this.isEditing ? this.target[this.derivedUnitsPropertyName] : this.source?.[this.derivedUnitsPropertyName];
  }

  set unitsValue(value: string) {
    this.target[this.derivedUnitsPropertyName] = value;
  }
}
