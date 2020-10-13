import { Component, ElementRef, OnDestroy, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription, Observable } from 'rxjs';
import moment from 'moment';
import numeral from 'numeral';

import { AudioComponent } from '../../../shared/components';
import { ApiService } from '../../../shared/services';
import { SceneService } from '../scene.service';
import { Patient } from './patient';

@Component({
  templateUrl: './scan-patient.component.html',
  styleUrls: ['./modal.scss', './scan-patient.component.scss'],
})
export class ScanPatientComponent implements OnDestroy {
  devices: any[] = null;
  selectedDevice: any = null;

  isLoading = false;
  pin: string = null;

  constructor(private api: ApiService, public scene: SceneService, private route: ActivatedRoute, private router: Router) {}

  ngOnDestroy() {}

  onCancel() {
    this.router.navigate([{ outlets: { modal: null } }], {
      preserveFragment: true,
      queryParamsHandling: 'preserve',
      relativeTo: this.route.parent,
    });
  }

  onCamerasFound(devices: any[]) {
    this.devices = devices;
    if (devices.length > 0) {
      this.selectedDevice = devices[0];
    }
  }

  onScanSuccess(pin: string) {
    if (!this.isLoading) {
      this.pin = pin;
      this.onSubmit();
    }
  }

  onSubmit() {
    this.isLoading = true;
    this.router.navigate([{ outlets: { modal: ['patients', 'new', { pin: this.pin }] } }], {
      preserveFragment: true,
      queryParamsHandling: 'preserve',
      relativeTo: this.route.parent,
      replaceUrl: true,
    });
  }
}
