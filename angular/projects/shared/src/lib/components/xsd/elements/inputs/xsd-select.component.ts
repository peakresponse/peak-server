import { Component } from '@angular/core';

import { XsdElementBaseComponent } from '../xsd-element-base.component';

@Component({
  selector: 'shared-xsd-select',
  templateUrl: './xsd-select.component.html',
})
export class XsdSelectComponent extends XsdElementBaseComponent {
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
