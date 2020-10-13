import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { empty, Subscription } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';

import { ApiService, NavigationService } from '../shared/services';

@Component({
  templateUrl: './url.component.html',
  styleUrls: ['./url.component.scss'],
})
export class UrlComponent {
  @ViewChild('subdomainEl') subdomainEl: ElementRef;
  @ViewChild('subdomainModel') subdomainModel: NgModel;

  stateId: string = null;
  agencyId: string = null;
  isLoading = true;
  isCreated = false;
  subdomain: string = '';
  subdomainChanges: Subscription;
  errorStatus: number = null;

  constructor(private route: ActivatedRoute, private api: ApiService, private navigation: NavigationService) {
    this.stateId = this.route.snapshot.queryParamMap.get('stateId');
    this.agencyId = this.route.snapshot.queryParamMap.get('agencyId');
  }

  ngOnInit() {
    this.api.agencies
      .get(this.agencyId)
      .pipe(
        catchError((res) => {
          this.isLoading = false;
          if (res.status == 404) {
            this.subdomain = res.error.subdomain;
          } else {
            /// TODO: show error
          }
          return empty();
        })
      )
      .subscribe((res) => {
        this.isLoading = false;
        this.isCreated = true;
        this.subdomain = res.body.subdomain;
      });
    setTimeout(() => (this.subdomainEl ? this.subdomainEl.nativeElement.focus() : null), 100);
  }

  ngAfterViewInit() {
    this.subdomainChanges = this.subdomainModel.valueChanges
      .pipe(
        tap(() => (this.isLoading = true)),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((value: string) => {
        this.errorStatus = null;
        this.api.agencies
          .validate(value)
          .pipe(
            catchError((res) => {
              if (this.subdomain == value) {
                console.log('ERROR', res);
                this.isLoading = false;
                this.errorStatus = res.status;
              }
              return empty();
            })
          )
          .subscribe(() => {
            if (this.subdomain == value) {
              this.isLoading = false;
            }
          });
      });
  }

  get isValid() {
    return this.subdomain != '' && !this.isLoading && !this.errorStatus;
  }

  ngOnDestroy() {
    this.subdomainChanges?.unsubscribe();
  }

  onBack() {
    this.navigation.backTo(`/agency?stateId=${this.stateId}`);
  }

  onCancel() {
    window.location.href = `${window.location.protocol}//${window.location.host}`;
  }

  onNext() {
    if (this.subdomain != '') {
      this.navigation.goTo('/account', {
        stateId: this.stateId,
        agencyId: this.agencyId,
        subdomain: this.subdomain,
      });
    }
  }
}
