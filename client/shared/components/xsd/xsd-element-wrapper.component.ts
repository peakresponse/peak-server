import { Component, EventEmitter, Input, Output } from '@angular/core';
import clone from 'lodash/clone';

import { SchemaService } from '../../services/schema.service';

import { XsdBaseComponent } from './xsd-base.component';

@Component({
  selector: 'app-shared-xsd-element-wrapper',
  templateUrl: './xsd-element-wrapper.component.html',
  styleUrls: ['./xsd-element-wrapper.component.scss']
})
export class XsdElementWrapperComponent extends XsdBaseComponent {
}
