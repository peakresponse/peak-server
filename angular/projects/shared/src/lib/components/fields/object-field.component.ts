import { Component, Input, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';

import { BaseFieldComponent } from './base-field.component';

@Component({
  selector: 'shared-object-field',
  templateUrl: './object-field.component.html',
  styles: [':host{display:block;}'],
})
export class ObjectFieldComponent extends BaseFieldComponent implements OnInit {
  @Input() objectIdProperty = 'id';
  @Input() objectNameProperty = 'name';
  @Input() objectFetchHandler: (id: string) => Observable<any | null> = (id: string) => of(null);
  @Input() searchHandler: (query: string) => Observable<any[]> = (query: string) => of([]);
  @Input() inputFormatter = (item: any): string => item[this.objectNameProperty];

  search: any = {
    object: null,
  };

  ngOnInit() {
    if (this.value) {
      this.objectFetchHandler(this.value).subscribe((object) => (this.search = { object }));
    }
  }

  onClear() {
    this.value = null;
    this.search = { object: null };
  }

  onSelect(item: any) {
    if (item) {
      this.value = item[this.objectIdProperty];
    }
  }
}
