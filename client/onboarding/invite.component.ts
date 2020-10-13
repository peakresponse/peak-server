import { Component, ViewChild, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { empty } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiService, NavigationService } from '../shared/services';

import { AppService } from './app.service';

@Component({
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.scss'],
})
export class InviteComponent {
  @ViewChild('firstEl') firstEl: ElementRef;
  @ViewChild('form') form: NgForm;

  agencyId: string = null;
  name: string = null;
  subdomain: string = null;
  data = {
    message: '',
    rows: [
      { fullName: '', email: '' },
      { fullName: '', email: '' },
    ],
  };
  emails = '';
  isLoading = false;
  errors: any = null;

  constructor(private app: AppService, private route: ActivatedRoute, private api: ApiService, private navigation: NavigationService) {
    this.agencyId = this.route.snapshot.queryParamMap.get('agencyId');
    if (!this.app.agency) {
      this.isLoading = true;
      this.api.agencies.get(this.agencyId).subscribe((res) => {
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
    setTimeout(() => (this.firstEl ? this.firstEl.nativeElement.focus() : null), 100);
  }

  onInputEmails() {
    this.data.rows = this.emails
      .split(',')
      .map((e) => ({ fullName: '', email: e.trim() }))
      .filter((row) => row.email != '');
  }

  onMore() {
    this.data.rows.push({ fullName: '', email: '' }, { fullName: '', email: '' });
  }

  get rows() {
    const rows = [];
    for (let row of this.data.rows) {
      if (row.email != '') {
        rows.push(row);
      }
    }
    return rows;
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
      this.errors = null;
      this.api.demographics.personnel
        .invite({ ...this.data, rows: this.rows }, this.subdomain)
        .pipe(
          catchError((res) => {
            this.isLoading = false;
            this.errors = res.error.messages;
            return empty();
          })
        )
        .subscribe((res) => {
          this.isLoading = false;
          this.onSkip();
        });
    }
  }
}
