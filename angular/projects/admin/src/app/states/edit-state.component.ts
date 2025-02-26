import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse } from '@angular/common/http';

import { ApiService, NavigationService, SchemaService } from 'shared';

@Component({
  templateUrl: './edit-state.component.html',
  standalone: false,
})
export class EditStateComponent {
  id: string = '';
  state: any;
  states?: any[];

  agencyStats: any;
  cityStats: any;
  countyStats: any;
  facilityStats: any;
  facilityTypes: any;
  psapStats: any;

  isImportingPsaps = false;

  constructor(
    private api: ApiService,
    private navigation: NavigationService,
    public route: ActivatedRoute,
    private schema: SchemaService,
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.state = this.route.snapshot.data['state'];
    this.refreshAgencyStats();
    this.refreshCityStats();
    this.refreshCountyStats();
    this.refreshFacilityStats();
    this.refreshPsapStats();
    this.api.states.index().subscribe((response: HttpResponse<any>) => {
      this.states = response.body;
    });
    this.schema.get('/nemsis/xsd/sFacility_v3.json').subscribe(() => {
      this.facilityTypes = this.schema.getEnum('TypeOfFacility') ?? {};
    });
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

  onPsapsImport() {
    this.isImportingPsaps = true;
    this.api.states.importPsaps(this.id).subscribe(() => {
      this.refreshPsapStats();
      this.isImportingPsaps = false;
    });
  }

  refreshPsapStats() {
    this.api.states.getPsaps(this.id).subscribe((response: HttpResponse<any>) => (this.psapStats = response.body));
  }

  onSignupsEnabledChange(value: boolean) {
    this.api.states.update(this.id, { isConfigured: value }).subscribe();
  }
}
