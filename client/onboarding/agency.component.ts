import { Component, ElementRef, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import { Observable, of, empty } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  tap,
  switchMap,
} from 'rxjs/operators';

import { ApiService, NavigationService } from '../shared/services';
import { AppService } from './app.service';

@Component({
  templateUrl: './agency.component.html',
})
export class AgencyComponent {
  @ViewChild('agencyEl') agencyEl: ElementRef;

  stateId: string = null;
  agency: any = null;
  isLoading = false;

  constructor(
    private app: AppService,
    private api: ApiService,
    private navigation: NavigationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.stateId = this.route.snapshot.queryParamMap.get('stateId');
    if (this.app.state == null) {
      this.api.states
        .get(this.stateId)
        .subscribe((res) => (this.app.state = res.body));
    }
    setTimeout(
      () => (this.agencyEl ? this.agencyEl.nativeElement.focus() : null),
      100
    );
  }

  formatter = (result: { name: string }) => result.name;

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) =>
        this.api.agencies
          .index(
            new HttpParams().set('search', term).set('stateId', this.stateId)
          )
          .pipe(
            catchError(() => of([])),
            map((res) => res.body)
          )
      )
    );

  onBack() {
    this.navigation.backTo('/state');
  }

  onCancel() {
    window.location.href = `${window.location.protocol}//${window.location.host}`;
  }

  onNext() {
    if (this.agency && !this.isLoading) {
      this.isLoading = true;
      if (this.agency.id) {
        this.api.agencies
          .get(this.agency.id)
          .pipe(
            catchError((res) => {
              this.isLoading = false;
              this.navigation.goTo('/url', {
                stateId: this.stateId,
                agencyId: this.agency.id,
              });
              return empty();
            })
          )
          .subscribe((res) => {
            this.isLoading = false;
            this.app.agency = res.body;
            this.navigation.goTo('/exists', {
              stateId: this.stateId,
              agencyId: this.agency.id,
            });
          });
      } else {
        this.navigation.goTo('/notify', {
          reason: 'agency',
          state: this.app.state?.name,
          agency: this.agency,
        });
      }
    }
  }
}
