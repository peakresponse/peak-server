import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { ApiService, NavigationService } from 'shared';

import { PatientAgeUnits, PatientGender } from '../../models/patient';
import { UnitDisposition } from '../../models/disposition';
import { Report } from '../../models/report';
import models from '../../models';

@Component({
  templateUrl: './report.component.html',
  standalone: false,
})
export class ReportComponent implements OnDestroy {
  PatientAgeUnits = PatientAgeUnits;
  PatientGender = PatientGender;
  UnitDisposition = UnitDisposition;

  subscription?: Subscription;
  incidentId?: string | null;
  reportId?: string | null;
  report: any;

  constructor(
    private api: ApiService,
    private navigation: NavigationService,
    private route: ActivatedRoute,
  ) {
    this.subscription = this.route.paramMap.subscribe((paramMap) => {
      this.reportId = paramMap.get('reportId');
      if (this.reportId) {
        this.api.reports.get(this.reportId).subscribe((response) => {
          let data: any = {};
          for (const key of Object.keys(response.body)) {
            data[key] = {};
            for (const obj of response.body[key]) {
              data[key][obj.id] = obj;
            }
          }
          this.report = new Report(response.body['Report'][0], data, models);
        });
      }
    });
    this.subscription.add(
      this.route.parent?.paramMap.subscribe((paramMap) => {
        this.incidentId = paramMap.get('incidentId');
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onDone() {
    this.navigation.backTo(`/incidents/${this.incidentId}/reports`);
  }

  recordingTitle(i: number): string {
    return `Recording ${i + 1}`;
  }
}
