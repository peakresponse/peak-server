import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './list-states.component.html',
})
export class ListStatesComponent {
  constructor(public route: ActivatedRoute) {}

  borderingStates(records: any[], record: any): any[] {
    const borderStates = [...record.borderStates];
    return borderStates.map((s) => records.find((r) => r.id === s));
  }
}
