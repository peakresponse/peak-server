import { Component } from '@angular/core';

import { BaseDemographicsComponent } from './base-demographics.component';

@Component({
  templateUrl: './base-demographics.component.html',
  styleUrls: ['./base-demographics.component.scss'],
})
export class ConfigurationDemographicsComponent extends BaseDemographicsComponent {
  ngOnInit() {
    this.section = 'configuration';
    this.sectionHeader = 'Configuration';
    this.sectionSchemaPath = '/nemsis/xsd/dConfiguration_v3.json';
    this.sectionColumns = [
      { name: 'State', attr: ['dConfiguration.01'], class: 'col-5' },
    ];
    super.ngOnInit();
  }
}
