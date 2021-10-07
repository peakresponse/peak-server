import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';

import { OperatorFunction } from 'rxjs';

import { BaseFieldComponent } from './base-field.component';

@Component({
  selector: 'shared-search-field',
  templateUrl: './search-field.component.html',
  styles: [':host{display:block;}'],
})
export class SearchFieldComponent extends BaseFieldComponent {
  @Input() ngbTypeahead?: OperatorFunction<string, readonly any[]> | null;
  @Input() inputFormatter: (item: any) => string = (item: any) => item;
  @Input() resultTemplate?: TemplateRef<any>;

  @Input() debounceTime?: number;
  @Output() debouncedValueChange = new EventEmitter<string>();

  constructor() {
    super();
    this.id = 'search';
    this.source = { search: '' };
    this.target = this.source;
  }
}
