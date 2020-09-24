import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { SceneService } from './scene.service';
import { AgencyService } from '../agencies/agency.service';

@Component({
  templateUrl: './scene-summary.component.html',
  styleUrls: ['./scene-summary.component.scss'],
})
export class SceneSummaryComponent {
  now = new Date();

  constructor(
    public agency: AgencyService,
    private route: ActivatedRoute,
    private router: Router,
    public scene: SceneService
  ) {}

  show(patient: any) {
    this.router.navigate([{ outlets: { modal: ['patients', patient.id] } }], {
      relativeTo: this.route,
      preserveFragment: true,
      queryParamsHandling: 'preserve',
    });
  }
}
