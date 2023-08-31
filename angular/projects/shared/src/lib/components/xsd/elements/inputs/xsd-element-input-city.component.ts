import { Component } from '@angular/core';

import { XsdElementBaseComponent } from '../xsd-element-base.component';

@Component({
  selector: 'shared-xsd-element-input-city',
  templateUrl: './xsd-element-input-city.component.html',
})
export class XsdElementInputCityComponent extends XsdElementBaseComponent {
  onInput(event: any) {
    if (this.value === '') {
      this.delValue();
    }
  }
}
