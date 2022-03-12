import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpParams } from '@angular/common/http';

import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ApiService, NavigationService } from 'shared';

@Component({
  templateUrl: './new-psap-dispatcher.component.html',
})
export class NewPsapDispatcherComponent {
  constructor(private api: ApiService, private navigation: NavigationService, private route: ActivatedRoute) {}

  searchHandler = (query: string) =>
    this.api.users.index(new HttpParams().set('search', query)).pipe(
      catchError(() => of([])),
      map((res: any) => res.body)
    );

  formatter = (result: any) => `${result.firstName} ${result.lastName} <${result.email}>`;

  transformRecord = (record: any) => ({
    psapId: this.route.snapshot.params.psapId,
    userId: record.user.id,
    callSign: record.callSign,
  });

  onCreate() {
    this.navigation.backTo(`/psaps/${this.route.snapshot.params.psapId}/dispatchers`);
  }
}
