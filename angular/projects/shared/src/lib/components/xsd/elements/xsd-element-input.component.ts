import { Component } from '@angular/core';

import { XsdElementBaseComponent } from './xsd-element-base.component';

@Component({
  selector: 'shared-xsd-element-input',
  templateUrl: './xsd-element-input.component.html',
})
export class XsdElementComponentInput extends XsdElementBaseComponent {
  COMPONENT_TYPES = {
    city: 'city',
    input: 'input',
    select: 'select',
    selectState: 'select-state',
    unrecognized: 'unrecognized',
  };

  get componentType(): string {
    switch (this.type?._attributes?.name) {
      case 'ANSIStateCode':
        return this.COMPONENT_TYPES.selectState;
      case 'CityGnisCode':
        return this.COMPONENT_TYPES.city;
    }
    switch (this.primitiveType) {
      case 'xs:string':
        if (this.type['xs:restriction']['xs:enumeration']) {
          return this.COMPONENT_TYPES.select;
        }
        return this.COMPONENT_TYPES.input;
      case 'xs:date':
      case 'xs:decimal':
      case 'xs:integer':
      case 'xs:positiveInteger':
        return this.COMPONENT_TYPES.input;
      default:
        return this.COMPONENT_TYPES.unrecognized;
    }
  }
}
