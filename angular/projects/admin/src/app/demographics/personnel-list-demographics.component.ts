import { HttpResponse } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { assign } from 'lodash';

import { ApiService, ModalComponent, NotificationService } from 'shared';

import { SchemaListComponent } from '../schema/schema-list.component';

@Component({
  templateUrl: './personnel-list-demographics.component.html',
})
export class PersonnelListDemographicsComponent {
  @ViewChild('list') list?: SchemaListComponent;
  @ViewChild('refuseConfirmation') refuseConfirmation?: ModalComponent;

  sectionColumns = [
    {
      name: 'Last Name',
      attr: ['dPersonnel.NameGroup', 'dPersonnel.01'],
      class: 'col-2',
    },
    {
      name: 'First Name',
      attr: ['dPersonnel.NameGroup', 'dPersonnel.02'],
      class: 'col-2',
    },
    { name: 'Email', attr: ['dPersonnel.10'], class: 'col-3' },
  ];
  addlColumns = [{ name: '' }];

  invitations = {
    emails: '',
  };

  constructor(private api: ApiService, private notification: NotificationService, public route: ActivatedRoute) {}

  onApprove(event: Event, record: any) {
    event.stopPropagation();
    this.api.employments.approve(record.id).subscribe((response: HttpResponse<any>) => {
      assign(record, response.body);
    });
  }

  onRefuse(event: Event, record: any) {
    event.stopPropagation();
    this.refuseConfirmation?.show(record, { centered: true, size: 'lg' });
  }

  onConfirmRefuse(record: any) {
    this.api.employments.refuse(record.id).subscribe((response: HttpResponse<any>) => {
      assign(record, response.body);
      this.refuseConfirmation?.close();
    });
  }

  onResend(event: Event, record: any) {
    event.stopPropagation();
    this.api.demographics.personnel.resendInvitation(record.id).subscribe((response: HttpResponse<any>) => {
      record.invitationAt = new Date();
    });
  }

  onSendInvitations() {
    const rows = this.invitations.emails
      .split(/\n|,/)
      .filter((email) => email.trim() !== '')
      .map((email) => ({ email: email.trim() }));
    this.api.demographics.personnel.invite({ rows }).subscribe((response: HttpResponse<any>) => {
      this.list?.refresh();
      this.notification.push('Invited!');
    });
  }
}
