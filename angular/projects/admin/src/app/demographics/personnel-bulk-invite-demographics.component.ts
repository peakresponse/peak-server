import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiService, ModalComponent, NotificationService } from 'shared';

@Component({
  selector: 'admin-personnel-bulk-invite',
  templateUrl: './personnel-bulk-invite-demographics.component.html',
})
export class PersonnelBulkInviteDemographicsComponent {
  @Output() invited = new EventEmitter<any>();
  @ViewChild('modal') modal?: ModalComponent;

  status?: any;
  invitations = {
    emails: '',
  };
  isLoading = false;
  isPolling = false;

  constructor(private api: ApiService, private notification: NotificationService) {}

  show() {
    this.isLoading = true;
    this.api.demographics.personnel
      .inviteStatus()
      .pipe(
        catchError((response: HttpErrorResponse) => {
          this.isLoading = false;
          return EMPTY;
        })
      )
      .subscribe((response: HttpResponse<any>) => {
        this.isLoading = false;
        this.status = response.body;
      });
    this.modal?.show(null, { centered: true, size: 'lg' });
  }

  onSendInvitations() {
    if (this.status) {
      this.status = null;
      this.invitations.emails = '';
    } else {
      const rows = this.invitations.emails
        .split(/\n|,/)
        .filter((email) => email.trim() !== '')
        .map((email) => ({ email: email.trim() }));
      this.isPolling = true;
      this.api.demographics.personnel.invite({ rows }).subscribe((response: HttpResponse<any>) => {
        this.poll();
      });
    }
  }

  poll() {
    setTimeout(() => {
      this.api.demographics.personnel.inviteStatus().subscribe((response: HttpResponse<any>) => {
        if (response.status == 202) {
          this.poll();
        } else {
          this.isPolling = false;
          this.status = response.body;
          this.invited.emit();
        }
      });
    }, 1000);
  }
}
