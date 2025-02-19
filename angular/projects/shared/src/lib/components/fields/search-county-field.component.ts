import { Component, ViewChild } from '@angular/core';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { of, EMPTY } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ApiService } from '../../services/api.service';
import { BaseFieldComponent } from './base-field.component';
import { SearchFieldComponent } from './search-field.component';

@Component({
  selector: 'shared-search-county-field',
  templateUrl: './search-county-field.component.html',
  standalone: false,
})
export class SearchCountyFieldComponent extends BaseFieldComponent {
  @ViewChild('instance') instance?: SearchFieldComponent;
  cache: any = {};

  getCounty(id: string): any {
    const county = this.cache[id];
    if (!county) {
      this.api.counties
        .get(id)
        .pipe(
          catchError(() => {
            this.cache[id] = {};
            this.instance?.rewriteValue();
            return EMPTY;
          }),
        )
        .subscribe((response: HttpResponse<any>) => {
          this.cache[id] = response.body;
          this.instance?.rewriteValue();
        });
    }
    return county;
  }

  inputFormatter = (id: string): string => {
    const county = this.getCounty(id);
    return `${county?.name ?? ''} (${id})`.trim();
  };

  resultFormatter = (id: string): string => {
    const county = this.getCounty(id);
    return `${county?.name ?? ''}, ${county?.stateAbbr ?? ''} (${id})`.trim();
  };

  searchHandler = (term: string) =>
    this.api.counties.index(new HttpParams().set('search', term)).pipe(
      catchError(() => of([])),
      map((res: HttpResponse<any>) =>
        res.body.map((county: any) => {
          this.cache[county.id] = county;
          return county.id;
        }),
      ),
    );

  constructor(private api: ApiService) {
    super();
  }
}
