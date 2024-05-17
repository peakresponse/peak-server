import { Component, ViewChild } from '@angular/core';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { Observable, OperatorFunction, Subject, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';

import { XsdElementBaseComponent } from '../xsd-element-base.component';

@Component({
  selector: 'shared-xsd-select',
  templateUrl: './xsd-select.component.html',
})
export class XsdSelectComponent extends XsdElementBaseComponent {
  @ViewChild('instance', { static: true }) instance?: NgbTypeahead;
  model: any;

  focus$ = new Subject<string>();
  click$ = new Subject<string>();
  search: OperatorFunction<string, readonly any[]> = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance?.isPopupOpen()));
    const inputFocus$ = this.focus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term: string) =>
        (term === ''
          ? this.enumeration
          : this.enumeration.filter((v) => v['xs:annotation']['xs:documentation']._text.toLowerCase().indexOf(term.toLowerCase()) > -1)
        ).slice(0, 10),
      ),
    );
  };

  formatter = (x: any) => x['xs:annotation']['xs:documentation']._text;

  get selectValue(): any {
    for (const item of this.enumeration) {
      if (item._attributes.value === this.value) {
        return item;
      }
    }
    return this.model;
  }

  onChange(newValue: any) {
    this.model = newValue;
    const { value, nemsisCode } = newValue?._attributes ?? {};
    if (nemsisCode) {
      this.setCustomValue(nemsisCode, value);
      return;
    }
    this.value = value;
  }
}
