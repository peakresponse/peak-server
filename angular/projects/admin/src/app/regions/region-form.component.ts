import { Component, Input } from '@angular/core';
import { HttpParams } from '@angular/common/http';

import { catchError, of, map } from 'rxjs';

import { ApiService } from 'shared';

@Component({
  selector: 'admin-regions-form',
  templateUrl: './region-form.component.html',
  standalone: false,
})
export class RegionFormComponent {
  @Input() record: any = null;
  @Input() error: any = null;

  constructor(private api: ApiService) {}

  agencySearchHandler = (query: string) =>
    this.api.agencies.index(new HttpParams().set('search', query)).pipe(
      catchError(() => of([])),
      map((res: any) => res.body),
    );

  agencyFormatter = (result: any) => `${result.name} (${result.stateUniqueId})`;

  facilitySearchHandler = (query: string) =>
    this.api.facilities.index(new HttpParams().set('search', query)).pipe(
      catchError(() => of([])),
      map((res: any) => res.body),
    );

  facilityFormatter = (result: any) => `${result.name} (${result.locationCode})`;
}
