import { Component, ElementRef, HostListener, OnDestroy, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription } from 'rxjs';
import { isEqual } from 'lodash';
import moment from 'moment';
import uuid from 'uuid';

import { AudioComponent } from '../../../shared/components';
import { ApiService, GeolocationService, UserService } from '../../../shared/services';
import { SceneService } from '../scene.service';
import { Patient } from './patient';
import { HttpParams } from '@angular/common/http';

@Component({
  templateUrl: './patient.component.html',
  styleUrls: ['./modal.scss', './patient.component.scss'],
})
export class PatientComponent implements OnDestroy {
  @ViewChild('modalBodyEl') modalBodyEl: ElementRef;

  private id: string = null;
  private intervalId: any;
  private position: any;
  private subscription = new Subscription();

  now = new Date();
  patient: any;
  observation: any;
  isEditingPriority = false;

  isEditingTransport = false;
  transportEditorHeight = 500;
  transportObservation: any;
  facilitySearch = '';
  facilityFilter = '1701005';
  facilitySearchParams = new HttpParams().set('type', this.facilityFilter);
  agencySearch = '';

  private isSaving = false;

  get filterPriority(): number {
    return this.observation?.['filterPriority'] ?? this.patient?.['filterPriority'];
  }

  get priority(): number {
    return this.observation?.['priority'] ?? this.patient?.['priority'];
  }

  get isTransportedLeftIndependently(): boolean {
    return (
      this.transportObservation?.['isTransportedLeftIndependently'] ??
      this.observation?.['isTransportedLeftIndependently'] ??
      this.patient?.['isTransportedLeftIndependently']
    );
  }

  @ViewChildren('audio') audio: QueryList<AudioComponent>;

  constructor(
    private api: ApiService,
    private geolocation: GeolocationService,
    public scene: SceneService,
    private route: ActivatedRoute,
    private router: Router,
    public user: UserService
  ) {
    this.intervalId = setInterval(() => (this.now = new Date()), 1000);

    this.subscription.add(
      this.geolocation.position$.subscribe((position: any) => {
        this.position = position;
        this.updateFacilitySearchParams();
      })
    );

    this.id = this.route.snapshot.params['id'];
    if (this.id != 'new') {
      this.subscription.add(
        this.scene.patient$(this.id).subscribe((patient) => {
          if (this.isSaving) {
            if (patient.currentId == this.observation.id) {
              this.patient = new Patient(patient);
              this.observation = null;
              this.isSaving = false;
            }
          } else {
            this.patient = new Patient(patient);
          }
        })
      );
    } else {
      const sceneId = this.scene.id;
      const pin = this.route.snapshot.params['pin'];
      this.observation = new Patient({
        id: uuid.v4(),
        sceneId,
        pin,
      });
    }
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
    this.subscription.unsubscribe();
  }

  onCancel() {
    if (this.observation) {
      this.observation = null;
      if (this.patient) {
        return;
      }
    }
    this.router.navigate([{ outlets: { modal: null } }], {
      preserveFragment: true,
      queryParamsHandling: 'preserve',
      relativeTo: this.route.parent,
    });
  }

  onEdit() {
    this.observation = this.patient.cloneDeep();
    this.observation['id'] = uuid.v4();
    this.observation['parentId'] = this.patient.currentId;
  }

  onPriority(priority: number) {
    if (this.observation) {
      this.observation['priority'] = priority;
    } else {
      if (this.patient.priority != priority) {
        this.observation = this.patient.cloneDeep();
        this.observation['id'] = uuid.v4();
        this.observation['parentId'] = this.patient.currentId;
        this.observation['priority'] = priority;
        this.onSave();
      }
    }
    this.isEditingPriority = false;
  }

  onShowTransport() {
    this.isEditingTransport = true;
    if (!this.observation) {
      this.transportObservation = this.patient.cloneDeep();
      this.transportObservation['id'] = uuid.v4();
      this.transportObservation['parentId'] = this.patient.currentId;
      this.transportObservation['isTransported'] = true;
    }
    this.calculateTransportHeight();
  }

  onHideTransport() {
    this.isEditingTransport = false;
    this.transportObservation = null;
  }

  setIsTransportedLeftIndependently(leftIndependently: boolean) {
    const observation = this.transportObservation ?? this.observation;
    observation['isTransportedLeftIndependently'] = leftIndependently;
    if (leftIndependently) {
      observation['transportAgencyId'] = null;
      observation['transportFacilityId'] = null;
    }
  }

  onChangeFacilityFilter(newValue: string) {
    this.facilityFilter = newValue;
    this.updateFacilitySearchParams();
  }

  updateFacilitySearchParams() {
    this.facilitySearchParams = new HttpParams().set('type', this.facilityFilter);
    if (this.position) {
      this.facilitySearchParams = this.facilitySearchParams
        .set('lat', this.position.coords.latitude)
        .set('lng', this.position.coords.longitude);
    }
  }

  setTransportFacility(facilityId: string) {
    this.transportObservation['transportFacilityId'] = facilityId;
  }

  setTransportAgency(agencyId: string) {
    this.transportObservation['transportAgencyId'] = agencyId;
  }

  @HostListener('window:resize')
  calculateTransportHeight() {
    let element = this.modalBodyEl.nativeElement;
    // first offsetTop relative to modal container
    let top = element.offsetTop;
    element = element.offsetParent;
    this.transportEditorHeight = element.offsetHeight - top;
  }

  onTransport() {
    if (this.observation) {
      this.observation['isTransported'] = true;
    } else if (this.transportObservation) {
      this.observation = this.transportObservation;
      this.onSave();
    }
    this.onHideTransport();
  }

  onCancelTransport() {
    if (this.observation) {
      this.observation['isTransported'] = false;
    } else {
      this.observation = this.patient.cloneDeep();
      this.observation['id'] = uuid.v4();
      this.observation['parentId'] = this.patient.currentId;
      this.observation['isTransported'] = false;
      this.observation['isTransportedLeftIndependently'] = false;
      this.observation['transportAgencyId'] = null;
      this.observation['transportFacilityId'] = null;
      this.onSave();
    }
  }

  onSave() {
    /// only save changed attributes
    this.isSaving = true;
    const observation: any = {};
    observation.id = this.observation['id'];
    observation.parentId = this.observation['parentId'];
    observation.sceneId = this.observation['sceneId'];
    observation.pin = this.observation['pin'];
    let isDirty = false;
    for (let property of [
      'complaint',
      'priority',
      'location',
      'lat',
      'lng',
      'firstName',
      'lastName',
      'age',
      'ageUnits',
      'gender',
      'respiratoryRate',
      'pulse',
      'capillaryRefill',
      'triageMentalStatus',
      'bloodPressure',
      'gcsTotal',
      'isTransported',
      'isTransportedLeftIndependently',
      'transportAgencyId',
      'transportFacilityId',
    ]) {
      if (this.patient?.[property] !== this.observation[property]) {
        observation[property] = this.observation[property];
        isDirty = true;
      }
    }
    /// do a deep comparison of predictions
    if (!isEqual(this.patient?.predictions, this.observation.predictions)) {
      observation.predictions = this.observation.predictions;
      isDirty = true;
    }
    if (isDirty) {
      this.api.patients.createOrUpdate(observation).subscribe((response) => {
        if (this.patient) {
          /// wait until patient record is updated to latest version
          if (this.patient?.currentId === this.observation.id) {
            this.observation = null;
            this.isSaving = false;
          }
        } else {
          this.onCancel();
        }
      });
    }
  }

  observations(patient: any): any[] {
    if (patient?.versions) {
      return patient.versions
        .filter((o: any) => o.text)
        .sort((a: any, b: any) => moment(b.updatedAt).valueOf() - moment(a.updatedAt).valueOf());
    }
    return null;
  }
}
