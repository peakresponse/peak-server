import { Component, EventEmitter, Input, Output } from '@angular/core';
import clone from 'lodash/clone';

import { SchemaService } from '../../services/schema.service';

import { XsdBaseComponent } from './xsd-base.component';

let STATES: any[];

@Component({
  selector: 'app-shared-xsd-select-state',
  templateUrl: './xsd-select-state.component.html',
})
export class XsdSelectStateComponent extends XsdBaseComponent {
  STATES: any[];

  ngOnInit() {
    if (STATES) {
      this.STATES = STATES;
    } else {
      this.api.states.index().subscribe((res) => {
        STATES = res.body;
        this.STATES = STATES;
      });
    }
  }
}
