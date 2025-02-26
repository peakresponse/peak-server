import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { AgencyService, ApiService, NavigationService } from 'shared';

@Component({
  templateUrl: './dashboard-demographics.component.html',
  standalone: false,
})
export class DashboardDemographicsComponent implements OnInit {
  record: any;
  isLoading = false;

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
    this.isLoading = true;
    this.api.versions.create().subscribe((response: HttpResponse<any>) => {
      this.agency.refresh();
      this.isLoading = false;
      this.navigation.goTo(`/demographics/versions/${response.body.id}`);
    });
  }

  onCommit() {
    const { id } = this.record?.draftVersion ?? {};
    if (id) {
      this.isLoading = true;
      this.api.versions.commit(id).subscribe((response: HttpResponse<any>) => {
        this.agency.refresh();
        this.isLoading = false;
      });
    }
  }

  onDemDataSetDrop() {
    const { id } = this.record?.draftVersion ?? {};
    if (id) {
      this.isLoading = true;
    }
  }

  onDemDataSetUploaded(upload: any) {
    const { id } = this.record?.draftVersion ?? {};
    if (id) {
      const { href: file, name: fileName } = upload;
      this.api.versions.import(id, file, fileName).subscribe((response: HttpResponse<any>) => {
        if (response.status === 202) {
          this.pollDemDataSetImport();
        } else {
          this.isLoading = false;
        }
      });
    }
  }

  pollDemDataSetImport() {
    const { id } = this.record?.draftVersion ?? {};
    if (id) {
      setTimeout(() => {
        this.api.versions.importStatus(id).subscribe((response: HttpResponse<any>) => {
          if (response.status === 202) {
            this.pollDemDataSetImport();
          } else {
            this.isLoading = false;
          }
        });
      }, 100);
    }
  }
}
