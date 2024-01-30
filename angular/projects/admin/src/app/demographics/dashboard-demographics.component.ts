import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { AgencyService, ApiService, NavigationService } from 'shared';

@Component({
  templateUrl: './dashboard-demographics.component.html',
})
export class DashboardDemographicsComponent implements OnInit {
  record: any;
  isCreatingNewVersion = false;
  isCommittingNewVersion = false;

  schematronsInstalled: any[] = [];
  schematronById(id: string): any {
    return this.schematronsInstalled.find((st) => st.id === id);
  }

  constructor(
    private agency: AgencyService,
    private api: ApiService,
    private navigation: NavigationService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route?.parent?.data.subscribe((data: any) => {
      this.record = data?.agency;
    });
    this.api.nemsisSchematrons.index().subscribe((response: HttpResponse<any>) => {
      this.schematronsInstalled = response.body;
    });
  }

  onNewVersion() {
    this.isCreatingNewVersion = true;
    this.api.versions.create().subscribe((response: HttpResponse<any>) => {
      this.agency.refresh();
      this.isCreatingNewVersion = false;
      this.navigation.goTo(`/demographics/versions/${response.body.id}`);
    });
  }

  onCommit() {
    const { id } = this.record?.draftVersion ?? {};
    if (id) {
      this.isCommittingNewVersion = true;
      this.api.versions.commit(id).subscribe((response: HttpResponse<any>) => {
        this.agency.refresh();
        this.isCommittingNewVersion = false;
      });
    }
  }
}
