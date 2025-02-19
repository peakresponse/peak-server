import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiService, NavigationService, TextFieldComponent } from 'shared';

@Component({
  templateUrl: './url.component.html',
  styleUrls: ['./url.component.scss'],
  standalone: false,
})
export class UrlComponent {
  @ViewChild('subdomainEl') subdomainEl?: TextFieldComponent;

  stateId?: string;
  agencyId?: string;
  isLoading = true;
  isCreated = false;
  baseHost = 'peakresponse.net';
  data: any = {
    subdomain: '',
  };
  errorStatus?: number;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private navigation: NavigationService,
  ) {
    this.baseHost = (window as any).env.BASE_HOST;
    this.stateId = this.route.snapshot.queryParamMap.get('stateId') ?? undefined;
    this.agencyId = this.route.snapshot.queryParamMap.get('agencyId') ?? undefined;
  }

  ngOnInit() {
    this.api.agencies
      .check(this.agencyId ?? '')
      .pipe(
        catchError((res) => {
          this.isLoading = false;
          if (res.status == 404) {
            this.data.subdomain = res.error.subdomain;
          } else {
            /// TODO: show error
          }
          return EMPTY;
        }),
      )
      .subscribe((res) => {
        this.isLoading = false;
        this.isCreated = true;
        this.data.subdomain = res.body.subdomain;
      });
    setTimeout(() => this.subdomainEl?.focus(), 100);
  }

  validate(value: string) {
    this.data.subdomain = value;
    this.errorStatus = undefined;
    this.api.agencies
      .validate(value)
      .pipe(
        catchError((res) => {
          if (this.data.subdomain == value) {
            this.isLoading = false;
            this.errorStatus = res.status;
          }
          return EMPTY;
        }),
      )
      .subscribe(() => {
        if (this.data.subdomain == value) {
          this.isLoading = false;
        }
      });
  }

  get isValid() {
    return this.data.subdomain != '' && !this.isLoading && !this.errorStatus;
  }

  onBack() {
    this.navigation.backTo(`/agency?stateId=${this.stateId}`);
  }

  onCancel() {
    window.location.href = `${window.location.protocol}//${window.location.host}`;
  }

  onNext() {
    if (this.data.subdomain != '') {
      this.navigation.goTo('/account', {
        stateId: this.stateId,
        agencyId: this.agencyId,
        subdomain: this.data.subdomain,
      });
    }
  }
}
