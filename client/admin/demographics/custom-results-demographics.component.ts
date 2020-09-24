import { Component } from '@angular/core';

import { BaseDemographicsComponent } from './base-demographics.component';

@Component({
  templateUrl: './base-demographics.component.html',
  styleUrls: ['./base-demographics.component.scss'],
})
export class CustomResultsDemographicsComponent extends BaseDemographicsComponent {
  ngOnInit() {
    this.section = 'customResults';
    this.sectionHeader = 'Custom Results';
    this.sectionSchemaPath = '/nemsis/xsd/dCustom_v3.json';
    this.sectionSchemaRootElementName = 'dCustomResults';
    super.ngOnInit();
  }
}
