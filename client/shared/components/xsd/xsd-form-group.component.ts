import { Component, EventEmitter, Input, Output } from '@angular/core';
import clone from 'lodash/clone';

import { SchemaService } from '../../services/schema.service';

import { XsdBaseComponent } from './xsd-base.component';

@Component({
  selector: 'app-shared-xsd-form-group',
  templateUrl: './xsd-form-group.component.html',
  styleUrls: ['./xsd-form-group.component.scss'],
})
export class XsdFormGroupComponent extends XsdBaseComponent {}
