import { Component, ViewChild } from '@angular/core';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { of, EMPTY } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ApiService } from '../../services/api.service';
import { BaseFieldComponent } from './base-field.component';
import { SearchFieldComponent } from './search-field.component';

@Component({
  selector: 'shared-search-city-field',
  templateUrl: './search-city-field.component.html',
  standalone: false,
})
export class SearchCityFieldComponent extends BaseFieldComponent {
  @ViewChild('instance') instance?: SearchFieldComponent;
  cache: any = {};

  getCity(id: string): any {
    const city = this.cache[id];
    if (!city) {
      this.api.cities
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
    return city;
  }

  inputFormatter = (id: string): string => {
    const city = this.getCity(id);
    return `${city?.featureName ?? ''} (${id})`.trim();
  };

  resultFormatter = (id: string): string => {
    const city = this.getCity(id);
    return `${city?.featureName ?? ''}, ${city?.stateAlpha ?? ''} (${id}, ${city?.featureClass})`.trim();
  };

  searchHandler = (term: string) =>
    this.api.cities.index(new HttpParams().set('search', term)).pipe(
      catchError(() => of([])),
      map((res: HttpResponse<any>) =>
        res.body.map((city: any) => {
          this.cache[city.id] = city;
          return city.id;
        }),
      ),
    );

  constructor(private api: ApiService) {
    super();
  }
}
