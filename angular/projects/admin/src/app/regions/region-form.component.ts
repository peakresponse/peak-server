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

  designations = [
    { value: '4224003', label: 'Adult Trauma' },
    { value: '4224005', label: 'Cardiac Arrest' },
    { value: '4224007', label: 'Obstetrics' },
    { value: '4224009', label: 'Other' },
    { value: '4224011', label: 'Pediatric Trauma' },
    { value: '4224013', label: 'STEMI' },
    { value: '4224015', label: 'Stroke' },
    { value: '4224017', label: 'Trauma (General)' },
    { value: '4224019', label: 'Sepsis' },
  ];

  constructor(private api: ApiService) {}

  labelFor(value: string): string | undefined {
    return this.designations.find((d) => d.value === value)?.label;
  }

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
