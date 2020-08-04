import { Component, ElementRef, OnDestroy, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription, Observable } from 'rxjs';
import moment from 'moment';
import numeral from 'numeral';

import { AudioComponent } from '../../../shared/components';
import { ApiService } from '../../../shared/services';
import { SceneService } from '../scene.service';
import { Patient} from './patient';

@Component({
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.scss']
})
export class PatientComponent implements OnDestroy {
  private id: string = null;
  private intervalId: any;
  private subscription = new Subscription();

  now = new Date();
  patient: Patient;
  observation: Patient;
  isEditingPriority = false;

  private isSaving = false;
  private newVersion: number = null;

  get priority(): number {
    return this.observation?.['priority'] ?? this.patient['priority'];
  }

  @ViewChildren('audio') audio: QueryList<AudioComponent>;

  constructor(private api: ApiService, private scene: SceneService, private route: ActivatedRoute, private router: Router) {
    this.intervalId = setInterval(() => this.now = new Date(), 1000);
    this.subscription.add(this.route.params.subscribe(params => {
      this.id = params['id'];
      this.subscription.add(this.scene.patient$(this.id).subscribe(patient => {
        if (this.isSaving) {
          if (patient.version == this.newVersion) {
            this.patient = new Patient(patient);
            this.observation = null;
            this.isSaving = false;
            this.newVersion = null;
          }
        } else {
          this.patient = new Patient(patient);
        }
      }));
    }));
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
    this.subscription?.unsubscribe();
  }

  onCancel() {
    if (this.observation) {
      this.observation = null;
    } else {
      this.router.navigate([{outlets: {modal: null}}], {
        preserveFragment: true,
        queryParamsHandling: 'preserve',
        relativeTo: this.route.parent
      });
    }
  }

  onEdit() {
    this.observation = this.patient.cloneDeep();
  }

  onPriority(priority: number) {
    if (this.observation) {
      this.observation['priority'] = priority;
    } else {
      this.observation = this.patient.cloneDeep();
      this.observation['priority'] = priority;
      this.onSave();
    }
    this.isEditingPriority = false;
  }

  onSave() {
    /// only save updated
    this.isSaving = true;
    const observation: any = {};
    observation.pin = this.observation['pin'];
    let isDirty = false;
    for (let property of ['priority', 'location', 'lat', 'lng', 'firstName', 'lastName', 'age', 'respiratoryRate', 'pulse', 'capillaryRefill', 'bloodPressure']) {
      if (this.patient[property] !== this.observation[property]) {
        observation[property] = this.observation[property];
        isDirty = true;
      }
    }
    if (isDirty) {
      this.api.observations.create(observation)
        .subscribe(response => {
          this.newVersion = response.body['version'];
          /// wait until patient record is updated to latest version
          if (this.patient['version'] == this.newVersion) {
            this.observation = null;
            this.isSaving = false;
            this.newVersion = null;
          }
        });
    }
  }

  observations(patient: any): any[] {
    if (patient?.observations) {
      return patient.observations
        .filter((o: any) => o.text)
        .sort((a: any, b: any) => moment(b.updatedAt).valueOf() - moment(a.updatedAt).valueOf());
    }
    return null;
  }
}
