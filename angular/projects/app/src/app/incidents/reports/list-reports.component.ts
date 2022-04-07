import { HttpParams } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { ApiService, NavigationService } from 'shared';

import { Report } from '../../models/report';

@Component({
  templateUrl: './list-reports.component.html',
  styleUrls: ['./list-reports.component.scss'],
})
export class ListReportsComponent implements OnDestroy {
  subscription?: Subscription;
  incidentId?: string | null;
  reports?: any[];

  constructor(private api: ApiService, private navigation: NavigationService, public route: ActivatedRoute) {
    this.subscription = this.route.paramMap.subscribe((paramMap) => {
      this.incidentId = paramMap.get('incidentId');
      if (this.incidentId) {
        this.api.reports.index(new HttpParams().set('incidentId', this.incidentId)).subscribe((response) => {
          let data: any = {};
          for (const key of Object.keys(response.body)) {
            data[key] = {};
            for (const obj of response.body[key]) {
              data[key][obj.id] = obj;
            }
          }
          this.reports = response.body['Report'].map((r: any) => new Report(r, data));
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onDone() {
    this.navigation.backTo('/incidents');
  }
}
