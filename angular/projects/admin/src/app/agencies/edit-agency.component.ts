import { HttpParams, HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiService, NavigationService } from 'shared';

@Component({
  templateUrl: './edit-agency.component.html',
})
export class EditAgencyComponent {
  id: string = '';
  states: any = [];
  canonicalAgencyId: string = '';
  claimedAgencyId: string = '';

  constructor(private api: ApiService, private navigation: NavigationService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.api.states.index().subscribe((res: any) => (this.states = res.body));
    this.route.paramMap.subscribe((params: ParamMap) => (this.id = params.get('id') ?? ''));
  }

  onLoad(agency: any) {
    this.canonicalAgencyId = agency.canonicalAgencyId;
    this.claimedAgencyId = agency.claimedAgency?.id;
  }
}
