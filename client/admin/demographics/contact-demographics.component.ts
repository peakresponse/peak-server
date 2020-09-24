import { Component } from '@angular/core';

import { BaseDemographicsComponent } from './base-demographics.component';

@Component({
  templateUrl: './base-demographics.component.html',
  styleUrls: ['./base-demographics.component.scss'],
})
export class ContactDemographicsComponent extends BaseDemographicsComponent {
  ngOnInit() {
    this.section = 'contacts';
    this.sectionHeader = 'Contacts';
    this.sectionSchemaPath = '/nemsis/xsd/dContact_v3.json';
    this.sectionColumns = [
      { name: 'Last name', attr: ['dContact.02'], class: 'col-6' },
      { name: 'First name', attr: ['dContact.03'], class: 'col-5' },
    ];
    super.ngOnInit();
  }
}
