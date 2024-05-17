import { Component, ViewChild } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { Observable, OperatorFunction, Subject, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';

import { XsdElementBaseComponent } from '../xsd-element-base.component';

let STATES: any[];

@Component({
  selector: 'shared-xsd-select-state',
  templateUrl: './xsd-select-state.component.html',
})
export class XsdSelectStateComponent extends XsdElementBaseComponent {
  @ViewChild('instance', { static: true }) instance?: NgbTypeahead;
  model: any;

  focus$ = new Subject<string>();
  click$ = new Subject<string>();

  STATES: any[] = [];

  search: OperatorFunction<string, readonly any[]> = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance?.isPopupOpen()));
    const inputFocus$ = this.focus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term: string) =>
        (term === '' ? STATES : STATES.filter((v) => v.name.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10),
      ),
    );
  };

  formatter = (x: any) => x.name;

  ngOnInit() {
    if (STATES) {
      this.STATES = STATES;
    } else {
      this.api.states.index().subscribe((res: HttpResponse<any>) => {
        STATES = res.body;
        Object.freeze(STATES);
        this.STATES = STATES;
      });
    }
  }

  get state(): any {
    for (const state of this.STATES) {
      if (state.id === this.value) {
        return state;
      }
    }
    return this.model;
  }

  onChangeState(state: any) {
    this.model = state;
    this.value = state?.id;
  }
}
