import { Component, Input } from '@angular/core';
import { HttpParams } from '@angular/common/http';

import { catchError, of, map } from 'rxjs';

import { ApiService } from 'shared';

@Component({
  selector: 'admin-regions-form',
  templateUrl: './region-form.component.html',
})
export class RegionFormComponent {
  @Input() record: any = null;
  @Input() error: any = null;

  constructor(private api: ApiService) {}

  searchHandler = (query: string) =>
    this.api.agencies.index(new HttpParams().set('search', query)).pipe(
      catchError(() => of([])),
      map((res: any) => res.body),
    );

  formatter = (result: any) => `${result.name} (${result.stateUniqueId})`;
}
