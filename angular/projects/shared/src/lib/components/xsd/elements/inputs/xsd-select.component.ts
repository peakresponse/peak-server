import { Component } from '@angular/core';

import { XsdElementBaseComponent } from '../xsd-element-base.component';

@Component({
  selector: 'shared-xsd-select',
  templateUrl: './xsd-select.component.html',
})
export class XsdSelectComponent extends XsdElementBaseComponent {
  get minLength(): number | null {
    if (this.type?.['xs:restriction']?.['xs:minLength']?._attributes?.value) {
      return parseInt(this.type['xs:restriction']['xs:minLength']._attributes.value);
    }
    return null;
  }

  get maxLength(): number | null {
    if (this.type?.['xs:restriction']?.['xs:maxLength']?._attributes?.value) {
      return parseInt(this.type['xs:restriction']['xs:maxLength']._attributes.value);
    }
    return null;
  }

  get pattern(): string | null {
    if (this.type?.['xs:restriction']?.['xs:pattern']?._attributes?.value) {
      return this.type['xs:restriction']['xs:pattern']._attributes.value;
    }
    return null;
  }

  onChange(newValue: string) {
    for (let item of this.type?.['xs:restriction']?.['xs:enumeration']) {
      const { value, nemsisCode } = item._attributes ?? {};
      if (value === newValue && nemsisCode) {
        this.setCustomValue(nemsisCode, value);
        return;
      }
    }
    this.value = newValue;
  }
}
