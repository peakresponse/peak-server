import { Component } from '@angular/core';

import { XsdBaseComponent } from './xsd-base.component';

let STATES: any[];

@Component({
  selector: 'shared-xsd-select-state',
  templateUrl: './xsd-select-state.component.html',
})
export class XsdSelectStateComponent extends XsdBaseComponent {
  STATES: any[] = [];

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