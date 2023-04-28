import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { SchemaListComponent } from '../schema/schema-list.component';

@Component({
  templateUrl: './contacts-list-demographics.component.html',
})
export class ContactsListDemographicsComponent {
  @ViewChild('list') list?: SchemaListComponent;

  sectionColumns = [
    { name: 'Last name', attr: ['dContact.02'], class: 'col-6' },
    { name: 'First name', attr: ['dContact.03'], class: 'col-5' },
  ];

  constructor(public route: ActivatedRoute) {}
}
