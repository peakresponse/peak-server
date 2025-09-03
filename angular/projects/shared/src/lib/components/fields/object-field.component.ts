import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { get } from 'lodash-es';

import { BaseFieldComponent } from './base-field.component';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'shared-object-field',
  templateUrl: './object-field.component.html',
  styles: [':host{display:block;}'],
  standalone: false,
})
export class ObjectFieldComponent extends BaseFieldComponent implements OnChanges {
  @Input() objectIdProperty = 'id';
  @Input() objectNameProperty = 'name';
  @Input() objectApiPath: string | string[] = '';
  @Input() objectApiSearchParams = new HttpParams();
  @Input() objectFetchHandler: (id: string) => Observable<any | null> = (id: string) =>
    get(this.api, this.objectApiPath)
      .get(id)
      .pipe(map((response: HttpResponse<any>) => response.body));
  @Input() searchHandler: (search: string) => Observable<any[]> = (search: string) =>
    get(this.api, this.objectApiPath)
      .index(this.objectApiSearchParams.set('search', search))
      .pipe(map((response: HttpResponse<any[]>) => response.body ?? []));
  @Input() inputFormatter = (item: any): string => item[this.objectNameProperty];

  search: any = {
    object: null,
  };

  constructor(private api: ApiService) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['source']) {
      if (this.value && !this.search.object) {
        this.objectFetchHandler(this.value).subscribe((object: any) => {
          this.search = { object };
          if (!this.search.object[this.objectNameProperty]) {
            this.search.object[this.objectNameProperty] = this.inputFormatter(object);
          }
        });
      }
    }
  }

  onClear() {
    this.value = null;
    this.search = { object: null };
  }

  onSelect(item: any) {
    if (item) {
      this.value = item[this.objectIdProperty];
      if (!this.search.object[this.objectNameProperty]) {
        this.search.object[this.objectNameProperty] = this.inputFormatter(item);
      }
    }
  }
}
