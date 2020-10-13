import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { SceneService } from './scene.service';
import { Patient } from './patients';

@Component({
  templateUrl: './scene-patients.component.html',
  styleUrls: ['./scene-patients.component.scss'],
})
export class ScenePatientsComponent implements OnDestroy {
  tabIndex = 0;
  now = new Date();

  private intervalId: any;
  private querySubscription: Subscription;
  private fragmentSubscription: Subscription;

  constructor(private route: ActivatedRoute, private router: Router, public scene: SceneService) {
    this.intervalId = setInterval(() => (this.now = new Date()), 1000);
    this.querySubscription = this.route.queryParams.subscribe((params: Params) => {
      this.scene.sort = params['sort'] || this.scene.sort;
    });
    this.fragmentSubscription = this.route.fragment.subscribe((fragment: string) => {
      this.tabIndex = Patient.PRIORITIES.indexOf(fragment || this.scene.filter) + 1;
    });
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
    this.querySubscription?.unsubscribe();
    this.fragmentSubscription?.unsubscribe();
  }

  priorityMatch(patient: any): boolean {
    return this.tabIndex == 0 ? true : patient.priority == this.tabIndex - 1;
  }

  filter(tabIndex: number) {
    const fragment = tabIndex > 0 ? Patient.PRIORITIES[tabIndex - 1] : null;
    this.scene.filter = fragment;
    this.router.navigate(['/scenes', this.scene.id, 'patients'], {
      fragment,
      queryParamsHandling: 'preserve',
    });
  }

  sort(sort: string) {
    this.router.navigate(['/scenes', this.scene.id, 'patients'], {
      queryParams: { sort },
      preserveFragment: true,
    });
  }

  show(patient: any) {
    this.router.navigate([{ outlets: { modal: ['patients', patient.id] } }], {
      relativeTo: this.route,
      preserveFragment: true,
      queryParamsHandling: 'preserve',
    });
  }
}
