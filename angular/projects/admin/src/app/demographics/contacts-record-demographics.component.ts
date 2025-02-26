import { Component } from '@angular/core';
import { AgencyService } from 'shared';

@Component({
  templateUrl: './contacts-record-demographics.component.html',
  standalone: false,
})
export class ContactsRecordDemographicsComponent {
  defaultValues = {
    isDraft: true,
    data: {},
  };

  constructor(public agency: AgencyService) {}
}
