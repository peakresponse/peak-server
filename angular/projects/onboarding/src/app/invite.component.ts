import { Component, ViewChild, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiService, NavigationService, TextFieldComponent } from 'shared';

import { AppService } from './app.service';

@Component({
  templateUrl: './invite.component.html',
  standalone: false,
})
export class InviteComponent {
  @ViewChild('firstEl') firstEl?: TextFieldComponent;
  @ViewChild('form') form?: NgForm;

  agencyId?: string;
  name?: string;
  subdomain?: string;
  data = {
    message: '',
    emails: '',
  };
  isLoading = false;
  error: any = null;

  constructor(
    private app: AppService,
    private route: ActivatedRoute,
    private api: ApiService,
    private navigation: NavigationService,
  ) {
    this.agencyId = this.route.snapshot.queryParamMap.get('agencyId') ?? undefined;
    if (!this.app.agency) {
      this.isLoading = true;
      this.api.agencies.check(this.agencyId ?? '').subscribe((res) => {
        this.isLoading = false;
        this.app.agency = res.body;
        this.initData();
      });
    } else {
      this.initData();
    }
  }

  initData() {
    this.name = this.app.agency.name;
    this.subdomain = this.app.agency.subdomain;
    this.data.message = this.app.agency.message;
  }

  ngOnInit() {
    setTimeout(() => this.firstEl?.focus(), 100);
  }

  get rows() {
    return this.data.emails
      .split(/\n|,/)
      .map((email) => ({ email: email.trim() }))
      .filter((row) => row.email != '');
  }

  get isValid() {
    return !this.isLoading && this.data.message != '' && this.rows.length > 0;
  }

  onSkip() {
    this.navigation.goTo(`/done`, { agencyId: this.agencyId });
  }

  onNext() {
    if (!this.isLoading) {
      this.isLoading = true;
      this.error = null;
      this.api.demographics.personnel
        .invite({ message: this.data.message, rows: this.rows }, this.subdomain)
        .pipe(
          catchError((res) => {
            this.isLoading = false;
            this.error = res.error;
            return EMPTY;
          }),
        )
        .subscribe((res) => {
          this.isLoading = false;
          this.onSkip();
        });
    }
  }
}
