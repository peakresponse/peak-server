import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { BaseFieldComponent } from './base-field.component';

@Component({
  selector: 'shared-search-field',
  templateUrl: './search-field.component.html',
  styles: [':host{display:block;}'],
})
export class SearchFieldComponent extends BaseFieldComponent {
  @Input() searchHandler: (query: string) => Observable<any[]> = (query: string) => of([]);
  @Input() inputFormatter: (item: any) => string = (item: any) => item;
  @Input() resultTemplate?: TemplateRef<any>;
  @Input() isSelectOnly: boolean = false;
  @Input() debounceTime?: number;
  @Output() debouncedValueChange = new EventEmitter<string>();

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(this.debounceTime ?? 300),
      distinctUntilChanged(),
      switchMap((text) => {
        this.debouncedValueChange.emit(text);
        return this.searchHandler(text);
      })
    );

  constructor() {
    super();
    this.id = 'search';
    this.source = { search: '' };
    this.target = this.source;
  }

  onClear() {
    super.onClear();
    this.debouncedValueChange.emit('');
  }
}
