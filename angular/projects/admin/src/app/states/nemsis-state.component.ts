import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { ApiService } from 'shared';

@Component({
  templateUrl: './nemsis-state.component.html',
})
export class NemsisStateComponent implements OnInit {
  id: string = '';
  state: any;
  get isImportingDataSet(): boolean {
    return this.state?.status?.code === 202;
  }

  repo: any;
  isRepoInitializing = false;

  dataSetsInstalled: any[] = [];
  get externalDataSets(): any[] {
    return this.dataSetsInstalled.filter((ds) => ds.version === null);
  }
  isDataSetInstalling?: string;

  schematronsInstalled: any[] = [];
  get externalSchematrons(): any[] {
    return this.schematronsInstalled.filter((st) => st.version === null);
  }

  constructor(private api: ApiService, public route: ActivatedRoute) {}

  ngOnInit() {
    this.id = this.route.snapshot.parent?.params['id'] ?? '';
    this.state = this.route.snapshot.parent?.data['state'];
    this.api.states.getRepository(this.id).subscribe((response: HttpResponse<any>) => (this.repo = response.body));
    this.api.nemsisStateDataSets
      .index(new HttpParams({ fromObject: { stateId: this.id } }))
      .subscribe((response: HttpResponse<any>) => (this.dataSetsInstalled = response.body));
  }

  onRepoInit() {
    this.isRepoInitializing = true;
    this.api.states.initRepository(this.id).subscribe(() => {
      this.pollRepo();
    });
  }

  pollRepo() {
    setTimeout(() => {
      this.api.states.getRepository(this.id).subscribe((response: HttpResponse<any>) => {
        this.repo = response.body;
        if (this.repo?.initialized) {
          this.isRepoInitializing = false;
        } else {
          this.pollRepo();
        }
      });
    }, 1000);
  }

  isDataSetInstalled(version: string): any {
    return this.dataSetsInstalled.find((ds) => ds.version === version);
  }

  onDataSetInstall(version: string) {
    if (this.isDataSetInstalling) {
      return;
    }
    this.isDataSetInstalling = version;
    this.api.nemsisStateDataSets
      .create({
        stateId: this.id,
        version,
      })
      .subscribe((response: HttpResponse<any>) => {
        this.isDataSetInstalling = undefined;
        this.dataSetsInstalled.push(response.body);
      });
  }

  onDataSetImport(dataSetVersion: string) {
    if (!this.isImportingDataSet) {
      this.api.states.importDataSet(this.id, dataSetVersion).subscribe((response: HttpResponse<any>) => {
        this.state = response.body;
        if (this.state.status?.code === 202) {
          this.pollImport();
        }
      });
    }
  }

  onCancelDataSetImport() {
    this.api.states.cancelImportDataSet(this.id).subscribe((response: HttpResponse<any>) => {
      this.state = response.body;
    });
  }

  pollImport() {
    setTimeout(() => {
      this.api.states.get(this.id).subscribe((response: HttpResponse<any>) => {
        this.state = response.body;
        if (this.state.status?.code === 202) {
          this.pollImport();
        }
      });
    }, 1000);
  }
}
