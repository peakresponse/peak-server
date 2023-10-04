import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { AgencyService, ApiService, XsdListComponent } from 'shared';

@Component({
  templateUrl: './facilities-list-demographics.component.html',
})
export class FacilitiesListDemographicsComponent implements OnInit {
  @ViewChild('list') list?: XsdListComponent;

  sectionColumns = [
    { name: 'Type', attr: ['dFacility.01'], class: 'col-5' },
    {
      name: 'Name',
      attr: ['dFacility.FacilityGroup', 'dFacility.02'],
      class: 'col-5',
    },
  ];

  states?: any[];
  importSearchParams = { search: '', stateId: '' };
  importSearchResults?: any[];
  importSearchSubscription?: Subscription;
  importIsLoading = false;

  isImporting?: string;
  isImported: string[] = [];

  constructor(public agency: AgencyService, private api: ApiService, public route: ActivatedRoute) {}

  ngOnInit() {
    this.route?.parent?.data.subscribe((data: any) => {
      this.importSearchParams = { ...this.importSearchParams, stateId: data?.agency?.stateId ?? '' };
    });
    this.api.states.index().subscribe((response: HttpResponse<any>) => (this.states = response.body));
  }

  onImportSearch(search: string) {
    this.importSearchSubscription?.unsubscribe();
    if (search) {
      this.importIsLoading = true;
      this.importSearchSubscription = this.api.facilities
        .index(new HttpParams({ fromObject: this.importSearchParams }))
        .subscribe((response: HttpResponse<any>) => {
          this.importSearchResults = response.body;
          this.importIsLoading = false;
        });
    } else {
      this.importIsLoading = false;
      this.importSearchResults = undefined;
    }
  }

  onImport(record: any) {
    this.isImporting = record?.id;
    this.api.demographics.facilities.import({ id: record?.id }).subscribe((response: HttpResponse<any>) => {
      this.isImporting = undefined;
      this.isImported.push(record?.id);
      this.list?.refresh();
    });
  }
}
