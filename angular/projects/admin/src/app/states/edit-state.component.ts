import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { FormComponent, ApiService, NavigationService, SchemaService } from 'shared';

@Component({
  templateUrl: './edit-state.component.html',
})
export class EditStateComponent {
  id: string = '';
  state: any;
  status: string = '';
  states?: any[];
  isConfiguring = false;
  isError = false;
  @ViewChild('form') form?: FormComponent;

  repo: any;
  isRepoInitializing = false;

  agencyStats: any;
  cityStats: any;
  countyStats: any;
  facilityStats: any;
  facilityTypes: any;
  psapStats: any;

  constructor(
    private api: ApiService,
    private navigation: NavigationService,
    private route: ActivatedRoute,
    private schema: SchemaService
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.api.states.get(this.id).subscribe((response: HttpResponse<any>) => {
      this.state = response.body;
      this.refreshAgencyStats();
      this.refreshCityStats();
      this.refreshCountyStats();
      this.refreshFacilityStats();
      this.refreshPsapStats();
      if (this.state.status?.code === 202) {
        this.pollImport();
      }
    });
    this.api.states.index().subscribe((response: HttpResponse<any>) => {
      this.states = response.body;
    });
    this.api.states.getRepository(this.id).subscribe((response: HttpResponse<any>) => (this.repo = response.body));
    this.schema.get('/nemsis/xsd/sFacility_v3.json').subscribe(() => {
      this.facilityTypes = this.schema.getEnum('TypeOfFacility') ?? {};
    });
    this.poll();
  }

  stateById(id: string): any {
    return this.states?.find((s) => s.id == id);
  }

  onDelete() {
    this.navigation.backTo(`/states`);
  }

  refreshAgencyStats() {
    this.api.states.getAgencies(this.id).subscribe((response: HttpResponse<any>) => (this.agencyStats = response.body));
  }

  refreshCityStats() {
    this.api.states.getCities(this.id).subscribe((response: HttpResponse<any>) => {
      this.cityStats = response.body;
      this.cityStats.total = this.cityStats.reduce((sum: number, stat: any) => (sum += stat.count), 0);
    });
  }

  refreshCountyStats() {
    this.api.states.getCounties(this.id).subscribe((response: HttpResponse<any>) => (this.countyStats = response.body));
  }

  refreshFacilityStats() {
    this.api.states.getFacilities(this.id).subscribe((response: HttpResponse<any>) => {
      this.facilityStats = response.body;
      this.facilityStats.total = this.facilityStats.reduce((sum: number, stat: any) => (sum += stat.count), 0);
    });
  }

  refreshPsapStats() {
    this.api.states.getPsaps(this.id).subscribe((response: HttpResponse<any>) => (this.psapStats = response.body));
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

  get isImportingDataSet(): boolean {
    return this.state?.status?.code === 202;
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

  onConfigure() {
    this.isConfiguring = true;
    this.isError = false;
    this.api.states.configure(this.id).subscribe(() => {
      this.poll();
    });
  }

  poll() {
    setTimeout(() => {
      this.api.states
        .get(this.id)
        .pipe(
          catchError((res) => {
            this.status = res.headers.get('X-Status');
            this.isConfiguring = false;
            this.isError = true;
            return EMPTY;
          })
        )
        .subscribe((res) => {
          this.status = res.headers.get('X-Status');
          const statusCode = res.headers.get('X-Status-Code');
          if (statusCode === '202') {
            this.isConfiguring = true;
            this.isError = false;
            this.poll();
          } else {
            this.isConfiguring = false;
            if (statusCode && statusCode !== '200') {
              this.isError = true;
            } else {
              this.form?.refresh();
            }
          }
        });
    }, 1000);
  }
}
