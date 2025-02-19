import { HttpParams } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { catchError, of, map } from 'rxjs';
import { ApiService } from 'shared';

@Component({
  selector: 'admin-exports-trigger-form',
  templateUrl: './export-trigger-form.component.html',
  standalone: false,
})
export class ExportTriggerFormComponent {
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
