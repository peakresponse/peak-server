import { HttpParams, HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiService, NavigationService } from 'shared';

@Component({
  templateUrl: './edit-agency.component.html',
  standalone: false,
})
export class EditAgencyComponent {
  id: string = '';
  states: any = [];
  canonicalAgencyId: string = '';
  claimedAgencyId: string = '';
  stateSearchParams = new HttpParams();

  constructor(
    private api: ApiService,
    private navigation: NavigationService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.api.states.index().subscribe((res: any) => (this.states = res.body));
    this.route.paramMap.subscribe((params: ParamMap) => (this.id = params.get('id') ?? ''));
  }

  onLoad(agency: any) {
    this.canonicalAgencyId = agency.canonicalAgencyId;
    this.claimedAgencyId = agency.claimedAgency?.id;
    this.stateSearchParams = new HttpParams();
    if (agency.stateId) {
      this.stateSearchParams = this.stateSearchParams.set('stateId', agency.stateId);
    }
  }

  onStateChange(stateId: string | undefined) {
    this.stateSearchParams = new HttpParams();
    if (stateId) {
      this.stateSearchParams = this.stateSearchParams.set('stateId', stateId);
    }
  }
}
