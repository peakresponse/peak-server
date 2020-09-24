import { Component, EventEmitter, Input, Output } from '@angular/core';
import clone from 'lodash/clone';

import { SchemaService } from '../../services/schema.service';

import { XsdBaseComponent } from './xsd-base.component';

@Component({
  selector: 'app-shared-xsd-select',
  templateUrl: './xsd-select.component.html',
})
export class XsdSelectComponent extends XsdBaseComponent {
  get minLength(): number {
    if (this.type?.['xs:restriction']?.['xs:minLength']?._attributes?.value) {
      return parseInt(
        this.type['xs:restriction']['xs:minLength']._attributes.value
      );
    }
    return null;
  }

  get maxLength(): number {
    if (this.type?.['xs:restriction']?.['xs:maxLength']?._attributes?.value) {
      return parseInt(
        this.type['xs:restriction']['xs:maxLength']._attributes.value
      );
    }
    return null;
  }

  get pattern(): string {
    if (this.type?.['xs:restriction']?.['xs:pattern']?._attributes?.value) {
      return this.type['xs:restriction']['xs:pattern']._attributes.value;
    }
    return null;
  }
}
