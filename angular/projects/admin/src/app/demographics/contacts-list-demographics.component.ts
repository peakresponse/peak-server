import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AgencyService } from 'shared';

@Component({
  templateUrl: './contacts-list-demographics.component.html',
  standalone: false,
})
export class ContactsListDemographicsComponent {
  sectionColumns = [
    { name: 'Last name', attr: ['dContact.02'], class: 'col-6' },
    { name: 'First name', attr: ['dContact.03'], class: 'col-5' },
  ];

  constructor(
    public agency: AgencyService,
    public route: ActivatedRoute,
  ) {}
}
