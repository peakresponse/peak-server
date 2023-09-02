import { Component } from '@angular/core';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { EMPTY, Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';

import { XsdElementBaseComponent } from '../xsd-element-base.component';

@Component({
  selector: 'shared-xsd-element-input-city',
  templateUrl: './xsd-element-input-city.component.html',
})
export class XsdElementInputCityComponent extends XsdElementBaseComponent {
  cache: any = {};

  getCity(id: string): any {
    const city = this.cache[id];
    if (!city) {
      this.delValue();
      this.api.cities
        .get(id)
        .pipe(
          catchError(() => {
            this.cache[id] = {};
            this.value = id;
            return EMPTY;
          })
        )
        .subscribe((response: HttpResponse<any>) => {
          this.cache[id] = response.body;
          this.value = id;
        });
    }
    return city;
  }

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((text: string) => {
        const params = new HttpParams({ fromObject: { search: text } });
        return this.api.cities.index(params).pipe(
          map((response: HttpResponse<any>) => {
            return response.body.map((city: any) => {
              this.cache[city.id] = city;
              return city.id;
            });
          })
        );
      })
    );

  inputFormatter = (id: string): string => {
    const city = this.getCity(id);
    return `${city?.featureName ?? ''} (${id})`.trim();
  };

  resultFormatter = (id: string): string => {
    const city = this.getCity(id);
    return `${city?.featureName ?? ''}, ${city?.stateAlpha ?? ''} (${id})`.trim();
  };
}
