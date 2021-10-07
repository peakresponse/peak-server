import { Component } from '@angular/core';

import { BaseDemographicsComponent } from './base-demographics.component';

@Component({
  templateUrl: './personnel-demographics.component.html',
  styleUrls: ['./base-demographics.component.scss'],
})
export class PersonnelDemographicsComponent extends BaseDemographicsComponent {
  ngOnInit() {
    this.section = 'personnel';
    this.sectionHeader = 'Personnel';
    this.sectionSchemaPath = '/nemsis/xsd/dPersonnelInvitation_v3.json';
    this.sectionColumns = [
      {
        name: 'Last Name',
        attr: ['dPersonnel.NameGroup', 'dPersonnel.01'],
        class: 'col-3',
      },
      {
        name: 'First Name',
        attr: ['dPersonnel.NameGroup', 'dPersonnel.02'],
        class: 'col-3',
      },
      {
        name: 'Middle Name/Initial',
        attr: ['dPersonnel.NameGroup', 'dPersonnel.03'],
        class: 'col-2',
      },
      { name: 'Email', attr: ['dPersonnel.10'], class: 'col-3' },
    ];
    super.ngOnInit();
  }

  newRecord() {
    const record = super.newRecord();
    (record as any)['dPersonnel.NameGroup'] = {};
    return record;
  }

  findRecord(id: string) {
    const record = super.findRecord(id);
    (record as any)['dPersonnel.NameGroup'] = record['dPersonnel.NameGroup'] || {};
    return record;
  }
}
