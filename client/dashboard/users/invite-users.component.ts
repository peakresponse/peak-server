import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { empty } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

import { AgencyService } from '../agencies/agency.service';
import { ApiService } from '../../shared/services';

@Component({
  templateUrl: './invite-users.component.html',
  styleUrls: ['./invite-users.component.scss'],
})
export class InviteUsersComponent implements OnInit {
  @ViewChild('firstEl') firstEl: ElementRef;
  @ViewChild('form') form: NgForm;

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

  constructor(
    private agency: AgencyService,
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.agency.attributes$.pipe(take(1)).subscribe((agency: any) => {
      this.data.message = agency.message;
    });
  }

  ngOnInit() {
    setTimeout(
      () => (this.firstEl ? this.firstEl.nativeElement.focus() : null),
      100
    );
  }

  onInputEmails() {
    this.data.rows = this.emails
      .split(',')
      .map((e) => ({ fullName: '', email: e.trim() }))
      .filter((row) => row.email != '');
  }

  onMore() {
    this.data.rows.push(
      { fullName: '', email: '' },
      { fullName: '', email: '' }
    );
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

  onClose() {
    this.router.navigate([{ outlets: { modal: null } }], {
      preserveFragment: true,
      queryParamsHandling: 'preserve',
      relativeTo: this.route.parent,
    });
  }

  onSubmit() {
    if (!this.isLoading) {
      this.isLoading = true;
      this.errors = null;
      this.api.demographics.personnel
        .invite({ ...this.data, rows: this.rows })
        .pipe(
          catchError((res) => {
            this.isLoading = false;
            this.errors = res.error.messages;
            return empty();
          })
        )
        .subscribe((res) => {
          this.isLoading = false;
          this.onClose();
        });
    }
  }
}
