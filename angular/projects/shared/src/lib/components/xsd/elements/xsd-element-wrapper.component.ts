import { Component } from '@angular/core';

import { XsdElementBaseComponent } from './xsd-element-base.component';

@Component({
  selector: 'shared-xsd-element-wrapper',
  templateUrl: './xsd-element-wrapper.component.html',
  styleUrls: ['./xsd-element-wrapper.component.scss'],
})
export class XsdElementWrapperComponent extends XsdElementBaseComponent {}
