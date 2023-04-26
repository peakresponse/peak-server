import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AgencyService } from 'shared';

@Component({
  templateUrl: './edit-version-demographics.component.html',
})
export class EditVersionDemographicsComponent {
  id: string = '';
  isDraft = false;

  constructor(private agency: AgencyService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
  }

  onLoad(record: any) {
    this.isDraft = record?.isDraft;
  }

  onUpdate() {
    this.agency.refresh();
  }
}
