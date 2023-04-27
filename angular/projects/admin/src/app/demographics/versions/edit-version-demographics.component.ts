import { Component } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import { AgencyService, ApiService, NavigationService, NotificationService } from 'shared';

@Component({
  templateUrl: './edit-version-demographics.component.html',
})
export class EditVersionDemographicsComponent {
  id: string = '';
  isDraft = false;

  schematronsInstalled: any[] = [];
  get demSchematronsInstalled(): any[] {
    return this.schematronsInstalled.filter((st) => st.dataSet === 'DEMDataSet');
  }
  get emsSchematronsInstalled(): any[] {
    return this.schematronsInstalled.filter((st) => st.dataSet === 'EMSDataSet');
  }
  schematronById(id: string): any {
    return this.schematronsInstalled.find((st) => st.id === id);
  }

  constructor(
    private agency: AgencyService,
    private api: ApiService,
    private navigation: NavigationService,
    private notification: NotificationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.api.nemsisSchematrons.index().subscribe((response: HttpResponse<any>) => {
      this.schematronsInstalled = response.body;
    });
  }

  onLoad(record: any) {
    this.isDraft = record?.isDraft;
  }

  onUpdate() {
    this.agency.refresh();
  }

  onDelete() {
    this.agency.refresh();
    this.notification.push('Version deleted!');
    this.navigation.backTo(`/demographics/versions`);
  }
}
