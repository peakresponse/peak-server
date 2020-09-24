import { Component, EventEmitter, Input, Output } from '@angular/core';
import clone from 'lodash/clone';

import { SchemaService } from '../../services/schema.service';

import { XsdBaseComponent } from './xsd-base.component';

@Component({
  selector: 'app-shared-xsd-datetime',
  templateUrl: './xsd-datetime.component.html',
})
export class XsdDateTimeComponent extends XsdBaseComponent {}
