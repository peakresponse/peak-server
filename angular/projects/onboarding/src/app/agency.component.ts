import { Component, ElementRef, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import { Observable, of, EMPTY } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, tap, switchMap } from 'rxjs/operators';

import { ApiService, NavigationService, SearchFieldComponent } from 'shared';
import { AppService } from './app.service';

@Component({
  templateUrl: './agency.component.html',
})
export class AgencyComponent {
  @ViewChild('agencyEl') agencyEl?: SearchFieldComponent;

  stateId: string = '';
  data: any = {
    agency: null,
  };
  isLoading = false;

  constructor(
    private app: AppService,
    private api: ApiService,
    private navigation: NavigationService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.stateId = this.route.snapshot.queryParamMap.get('stateId') ?? '';
    if (this.app.state == null) {
      this.api.states.get(this.stateId).subscribe((res) => (this.app.state = res.body));
    }
    setTimeout(() => this.agencyEl?.focus(), 100);
  }

  formatter = (result: { name: string }) => result.name;

  searchHandler = (term: string) =>
    this.api.agencies.index(new HttpParams().set('search', term).set('stateId', this.stateId)).pipe(
      catchError(() => of([])),
      map((res) => res.body),
    );

  onBack() {
    this.navigation.backTo('/state');
  }

  onCancel() {
    window.location.href = `${window.location.protocol}//${window.location.host}`;
  }

  onNext() {
    if (this.data.agency && !this.isLoading) {
      this.isLoading = true;
      if (this.data.agency.id) {
        this.api.agencies
          .check(this.data.agency.id)
          .pipe(
            catchError((res) => {
              this.isLoading = false;
              this.navigation.goTo('/url', {
                stateId: this.stateId,
                agencyId: this.data.agency.id,
              });
              return EMPTY;
            }),
          )
          .subscribe((res) => {
            this.isLoading = false;
            this.app.agency = res.body;
            this.navigation.goTo('/exists', {
              stateId: this.stateId,
              agencyId: this.data.agency.id,
            });
          });
      } else {
        this.navigation.goTo('/notify', {
          reason: 'agency',
          state: this.app.state?.name,
          agency: this.data.agency,
        });
      }
    }
  }
}
