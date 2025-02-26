import { Component } from '@angular/core';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { EMPTY, Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';

import { XsdElementBaseComponent } from '../xsd-element-base.component';

@Component({
  selector: 'shared-xsd-element-input-county',
  templateUrl: './xsd-element-input-county.component.html',
  standalone: false,
})
export class XsdElementInputCountyComponent extends XsdElementBaseComponent {
  cache: any = {};

  getCounty(id: string): any {
    const county = this.cache[id];
    if (!county) {
      this.delValue();
      this.api.counties
        .get(id)
        .pipe(
          catchError(() => {
            this.cache[id] = {};
            this.value = id;
            return EMPTY;
          }),
        )
        .subscribe((response: HttpResponse<any>) => {
          this.cache[id] = response.body;
          this.value = id;
        });
    }
    return county;
  }

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((text: string) => {
        const params = new HttpParams({ fromObject: { search: text } });
        return this.api.counties.index(params).pipe(
          map((response: HttpResponse<any>) => {
            return response.body.map((county: any) => {
              this.cache[county.id] = county;
              return county.id;
            });
          }),
        );
      }),
    );

  inputFormatter = (id: string): string => {
    const city = this.getCounty(id);
    return `${city?.name ?? ''} (${id})`.trim();
  };

  resultFormatter = (id: string): string => {
    const city = this.getCounty(id);
    return `${city?.name ?? ''}, ${city?.stateAbbr ?? ''} (${id})`.trim();
  };
}
