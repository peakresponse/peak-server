import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiService, NavigationService } from '../shared/services';

@Component({
  templateUrl: './url.component.html',
  styleUrls: ['./url.component.scss'],
})
export class UrlComponent {
  @ViewChild('subdomainEl') subdomainEl: ElementRef;

  stateId: string = null;
  agencyId: string = null;
  isLoading = true;
  isCreated = false;
  baseHost = 'peakresponse.net';
  subdomain: string = '';
  errorStatus: number = null;

  constructor(private route: ActivatedRoute, private api: ApiService, private navigation: NavigationService) {
    this.baseHost = window['env'].BASE_HOST;
    this.stateId = this.route.snapshot.queryParamMap.get('stateId');
    this.agencyId = this.route.snapshot.queryParamMap.get('agencyId');
  }

  ngOnInit() {
    this.api.agencies
      .check(this.agencyId)
      .pipe(
        catchError((res) => {
          this.isLoading = false;
          if (res.status == 404) {
            this.subdomain = res.error.subdomain;
          } else {
            /// TODO: show error
          }
          return EMPTY;
        })
      )
      .subscribe((res) => {
        this.isLoading = false;
        this.isCreated = true;
        this.subdomain = res.body.subdomain;
      });
    setTimeout(() => (this.subdomainEl ? this.subdomainEl.nativeElement.focus() : null), 100);
  }

  validate(value: string) {
    this.subdomain = value;
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
          return EMPTY;
        })
      )
      .subscribe(() => {
        if (this.subdomain == value) {
          this.isLoading = false;
        }
      });
  }

  get isValid() {
    return this.subdomain != '' && !this.isLoading && !this.errorStatus;
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
