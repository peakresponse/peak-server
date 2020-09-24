import { Component, EventEmitter, Input, Output } from '@angular/core';
import clone from 'lodash/clone';

import { SchemaService } from '../../services/schema.service';

import { XsdBaseComponent } from './xsd-base.component';

@Component({
  selector: 'app-shared-xsd-element',
  templateUrl: './xsd-element.component.html',
})
export class XsdElementComponent extends XsdBaseComponent {
  COMPONENT_TYPES = {
    datetime: 'datetime',
    input: 'input',
    select: 'select',
    selectState: 'select-state',
    unrecognized: 'unrecognized',
  };

  get componentType(): string {
    switch (this.type?._attributes?.name) {
      case 'ANSIStateCode':
        return this.COMPONENT_TYPES.selectState;
    }
    switch (this.primitiveType) {
      case 'xs:date':
        return this.COMPONENT_TYPES.datetime;
      case 'xs:string':
        if (this.type['xs:restriction']['xs:enumeration']) {
          return this.COMPONENT_TYPES.select;
        }
      /// fallthrough!
      case 'xs:decimal':
      case 'xs:integer':
      case 'xs:positiveInteger':
        return this.COMPONENT_TYPES.input;
      default:
        return this.COMPONENT_TYPES.unrecognized;
    }
  }
}
