import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { Observable, OperatorFunction, Subject, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';

import { XsdElementBaseComponent } from './xsd-element-base.component';

@Component({
  selector: 'shared-xsd-element-nillable',
  templateUrl: './xsd-element-nillable.component.html',
  styleUrls: ['./xsd-element-nillable.component.scss'],
})
export class XsdElementNillableComponent extends XsdElementBaseComponent {
  @Output() pasteMulti = new EventEmitter<string[]>();
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
          ? this.nilValues
          : this.nilValues.filter(
              (nv: any) =>
                nv['xs:restriction']['xs:enumeration']['xs:annotation']['xs:documentation']._text
                  .toLowerCase()
                  .indexOf(term.toLowerCase()) > -1,
            )
        ).slice(0, 10),
      ),
    );
  };

  formatter = (nv: any) => nv['xs:restriction']['xs:enumeration']['xs:annotation']['xs:documentation']._text;

  get nilValue(): any {
    for (const nv of this.nilValues) {
      if (nv['xs:restriction']['xs:enumeration']._attributes.value === this.NV) {
        return nv;
      }
    }
    return this.model;
  }

  onChange(newValue: any) {
    this.model = newValue;
    this.NV = newValue?.['xs:restriction']['xs:enumeration']._attributes.value;
  }

  onPasteMulti(lines: string[]) {
    this.pasteMulti.emit(lines);
  }

  onToggle($event: any) {
    const { checked } = $event?.target;
    setTimeout(() => {
      if (checked) {
        (document.querySelector(`[id="${this.formName}-NV"]`) as HTMLElement)?.focus();
      } else {
        (document.querySelector(`[id="${this.formName}"]`) as HTMLElement)?.focus();
        this.model = '';
      }
    }, 100);
  }
}
