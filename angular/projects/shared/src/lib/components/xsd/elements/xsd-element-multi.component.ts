import { Component, ElementRef } from '@angular/core';

import { XsdElementBaseComponent } from './xsd-element-base.component';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'shared-xsd-element-multi',
  templateUrl: './xsd-element-multi.component.html',
})
export class XsdElementMultiComponent extends XsdElementBaseComponent {
  constructor(
    private elementRef: ElementRef,
    protected api: ApiService,
  ) {
    super(api);
  }

  get canAdd() {
    if (Array.isArray(this.data[this.name])) {
      if (this.data[this.name].length > 0) {
        return this.data[this.name][0]._attributes?.['xsi:nil'] !== 'true';
      }
    } else {
      return this.data[this.name]?._attributes?.['xsi:nil'] !== 'true';
    }
    return true;
  }

  onAdd() {
    this.addValue({});
    setTimeout(() => {
      // for some reason querySelector :last-of-type selector not working, so fetching all
      const items: HTMLElement[] = Array.from(this.elementRef?.nativeElement.querySelectorAll('.form-field__item') ?? []);
      const item = items.pop();
      (item?.querySelector('input, select') as HTMLElement)?.focus();
    }, 100);
  }
}
