import { Component, ViewChild, ElementRef } from '@angular/core';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiService, NavigationService, TextFieldComponent } from 'shared';
import { AppService } from './app.service';

@Component({
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  standalone: false,
})
export class AccountComponent {
  @ViewChild('firstNameEl') firstNameEl?: TextFieldComponent;
  @ViewChild('form') form?: NgForm;

  exists = false;
  agency: any = null;
  stateId: string = '';
  data = {
    invitationCode: '',
    agencyId: '',
    subdomain: '',
    firstName: '',
    lastName: '',
    email: '',
    position: '',
    password: '',
    confirmPassword: '',
  };
  isDone = false;
  isPending = false;
  isLoading = false;
  error: any = null;

  constructor(
    private app: AppService,
    private route: ActivatedRoute,
    private api: ApiService,
    private navigation: NavigationService,
  ) {
    this.exists = this.route.snapshot.data.exists;
    this.stateId = this.route.snapshot.queryParamMap.get('stateId') ?? '';
    this.data.agencyId = this.route.snapshot.queryParamMap.get('agencyId') ?? '';
    this.data.invitationCode = this.route.snapshot.queryParamMap.get('invitationCode') ?? '';
    if (this.exists) {
      this.agency = this.app.agency;
      if (!this.agency) {
        this.isLoading = true;
        this.api.agencies.check(this.data.agencyId).subscribe((res: HttpResponse<any>) => {
          this.isLoading = false;
          this.agency = res.body;
        });
      }
      if (this.data.invitationCode) {
        this.api.demographics.personnel.getInvite(this.data.invitationCode).subscribe((res: HttpResponse<any>) => {
          this.data.email = this.data.email || res.body.email;
        });
      }
    } else {
      this.data.subdomain = this.route.snapshot.queryParamMap.get('subdomain') ?? '';
      if (!this.data.agencyId || !this.data.subdomain) {
        this.navigation.replaceWith('/welcome');
      }
    }
  }

  ngOnInit() {
    setTimeout(() => this.firstNameEl?.focus(), 100);
  }

  get isFirstStep() {
    return this.exists && !this.data.agencyId;
  }

  get isValid() {
    if (this.form && !this.isLoading) {
      return this.data.password != '' &&
        this.data.confirmPassword != '' &&
        this.form.valid &&
        this.isPasswordSecure &&
        this.isPasswordConfirmed
        ? true
        : false;
    }
    return false;
  }

  get isPasswordSecure() {
    return this.data.password == '' || this.data.password.match(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,30}$/) != null;
  }

  get isPasswordConfirmed() {
    return this.data.password == '' || this.data.confirmPassword == '' || this.data.password == this.data.confirmPassword;
  }

  onBack() {
    if (this.exists) {
      this.navigation.backTo(`/agency?stateId=${this.stateId}`);
    } else {
      this.navigation.backTo(`/url?stateId=${this.stateId}&agencyId=${this.data.agencyId}`);
    }
  }

  onCancel() {
    window.location.href = `${window.location.protocol}//${window.location.host}`;
  }

  onNext() {
    if (this.isValid) {
      this.isLoading = true;
      this.error = null;
      if (this.exists) {
        this.api.demographics.personnel
          .accept(this.data, this.agency.subdomain)
          .pipe(
            catchError((res) => {
              this.isLoading = false;
              this.error = res.error;
              return EMPTY;
            }),
          )
          .subscribe((res) => {
            this.isLoading = false;
            this.isDone = true;
            this.isPending = res.status == 202;
          });
      } else {
        this.api.agencies
          .claim(this.data.agencyId, this.data)
          .pipe(
            catchError((res) => {
              this.isLoading = false;
              this.error = res.error;
              console.log(res.error);
              return EMPTY;
            }),
          )
          .subscribe((res) => {
            this.isLoading = false;
            this.app.agency = res.body;
            this.navigation.goTo(`/invite`, { agencyId: this.data.agencyId });
          });
      }
    }
  }
}
