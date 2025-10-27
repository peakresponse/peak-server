import { Component, Input } from '@angular/core';
import { HttpParams } from '@angular/common/http';

import { catchError, of, map } from 'rxjs';

import { ApiService, SchemaService } from 'shared';

@Component({
  selector: 'admin-regions-form',
  templateUrl: './region-form.component.html',
  standalone: false,
})
export class RegionFormComponent {
  @Input() record: any = null;
  @Input() error: any = null;

  designations: any[] = [];

  constructor(
    private api: ApiService,
    private schema: SchemaService,
  ) {}

  ngOnInit(): void {
    this.schema.get('/nemsis/xsd/eDisposition_v3.json').subscribe(() => {
      const designationsMap = this.schema.getEnum('DestinationPrearrivalActivation');
      this.designations = Object.entries(designationsMap).map(([value, label]) => ({ value, label }));
    });
  }

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
