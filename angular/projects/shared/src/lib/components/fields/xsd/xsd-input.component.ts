import { Component } from '@angular/core';

import { XsdBaseComponent } from './xsd-base.component';

@Component({
  selector: 'shared-xsd-input',
  templateUrl: './xsd-input.component.html',
})
export class XsdInputComponent extends XsdBaseComponent {
  get inputType(): string {
    switch (this.primitiveType) {
      case 'xs:date':
        return 'date';
      case 'xs:decimal':
      case 'xs:integer':
      case 'xs:positiveInteger':
        return 'number';
      default:
        return 'text';
    }
  }

  get min(): number | null {
    if (this.type?.['xs:restriction']?.['xs:minInclusive']?._attributes?.value) {
      return parseInt(this.type['xs:restriction']['xs:minInclusive']._attributes.value);
    }
    return null;
  }

  get max(): number | null {
    if (this.type?.['xs:restriction']?.['xs:maxInclusive']?._attributes?.value) {
      return parseInt(this.type['xs:restriction']['xs:maxInclusive']._attributes.value);
    }
    return null;
  }

  get minLength(): number | null {
    if (this.type?.['xs:restriction']?.['xs:minLength']?._attributes?.value) {
      return parseInt(this.type['xs:restriction']['xs:minLength']._attributes.value);
    }
    if (this.type?.['xs:restriction']?.['xs:length']?._attributes?.value) {
      return parseInt(this.type['xs:restriction']['xs:length']._attributes.value);
    }
    return null;
  }

  get maxLength(): number | null {
    if (this.type?.['xs:restriction']?.['xs:maxLength']?._attributes?.value) {
      return parseInt(this.type['xs:restriction']['xs:maxLength']._attributes.value);
    }
    if (this.type?.['xs:restriction']?.['xs:length']?._attributes?.value) {
      return parseInt(this.type['xs:restriction']['xs:length']._attributes.value);
    }
    return null;
  }

  get pattern(): string | null {
    if (this.type?.['xs:restriction']?.['xs:pattern']?._attributes?.value) {
      return this.type['xs:restriction']['xs:pattern']._attributes.value;
    }
    return null;
  }

  get fractionDigits(): number | null {
    if (this.type?.['xs:restriction']?.['xs:fractionDigits']?._attributes?.value) {
      return parseInt(this.type['xs:restriction']['xs:fractionDigits']._attributes.value);
    }
    return null;
  }

  get totalDigits(): number | null {
    if (this.type?.['xs:restriction']?.['xs:totalDigits']?._attributes?.value) {
      return parseInt(this.type['xs:restriction']['xs:totalDigits']._attributes.value);
    }
    return null;
  }

  onInput(event: any) {
    if (this.value === '') {
      this.delValue();
    }
  }
}
