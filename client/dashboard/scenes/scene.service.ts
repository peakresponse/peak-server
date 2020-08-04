import { Injectable, OnDestroy } from '@angular/core';

import { Observable, of, EMPTY, Subscriber, Subscription }  from 'rxjs';
import { catchError, mergeMap, take } from 'rxjs/operators';

import assign from 'lodash/assign';
import find from 'lodash/find';
import orderBy from 'lodash/orderBy';
import moment from 'moment';

import { ApiService, WebSocketService } from '../../shared/services';

@Injectable()
export class SceneService implements OnDestroy {
  private subscription: Subscription = null;
  private scene: any = null;

  private _patients: any[] = [];
  private _filter: string = null;
  private _sort = 'priority';
  private patientsSubscribers: Subscriber<any[]>[] = [];

  private stats: any[] = Array(7).fill(null).map(() => ({total: 0, updates: []}));
  private statsSubscribers: Subscriber<any[]>[] = [];

  private patientSubscribers: any = {};

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  get id(): string {
    return this.scene?.id;
  }

  get name(): string {
    return this.scene?.name;
  }

  get isActive(): boolean {
    return this.scene?.isActive;
  }

  get filter(): string {
    return this._filter;
  }

  set filter(filter: string) {
    this._filter = filter;
  }

  get sort(): string {
    return this._sort;
  }

  set sort(sort: string) {
    this._sort = sort;
    this.resort();
  }

  get elapsedTime(): string {
    if (this.scene) {
      return moment.utc(moment().diff(moment(this.scene.createdAt))).format('HH:mm:ss');
    }
    return '--:--:--';
  }

  get elapsedTime$(): Observable<string> {
    return new Observable<string>(subscriber => {
      subscriber.next(this.elapsedTime);
      const intervalId = setInterval(() => subscriber.next(this.elapsedTime), 1000);
      return () => clearInterval(intervalId);
    });
  }

  get patients(): any[] {
    return this._patients;
  }

  get patients$(): Observable<any[]> {
    return new Observable<any[]>(subscriber => {
      this.patientsSubscribers.push(subscriber);
      subscriber.next(this._patients);
      return () => {
        const index = this.patientsSubscribers.indexOf(subscriber);
        this.patientsSubscribers.splice(index, 1);
      };
    });
  }

  get stats$(): Observable<any[]> {
    return new Observable<any[]>(subscriber => {
      this.statsSubscribers.push(subscriber);
      subscriber.next(this.stats);
      return () => {
        const index = this.statsSubscribers.indexOf(subscriber);
        this.statsSubscribers.splice(index, 1);
      };
    });
  }

  constructor(private api: ApiService, private ws: WebSocketService) { }

  load(id: string): Observable<any> {
    this.subscription?.unsubscribe();
    /// TODO fetch scene
    this.scene = {id: 'demo', name: 'Demo Scene', isActive: true, createdAt: new Date()};
    this.subscription = this.ws.connect()
      .subscribe(records => {
        /// process new records
        for (let record of records) {
          const found = find(this._patients, {id: record.id});
          if (!found) {
            this._patients.push(record);
          } else {
            assign(found, record);
            this.fetchPatient(record.id);
          }
          /// ignore the first connection updates
          if (this.ws.isConnected) {
            /// add to ALL updates list
            if (!found && !this.stats[0].updates.includes(record.id)) {
              this.stats[0].updates.push(record.id);
            }
            /// then remove from any other tabs it may have been in
            for (let i = 1; i < 7; i++) {
              this.stats[i].updates = this.stats[i].updates.filter((id: string) => id != record.id);
            }
            /// and add it to its current priority tab
            this.stats[record.priority + 1].updates.push(record.id);
          }
        }
        /// reset and update stats
        for (let stat of this.stats) {
          stat.total = 0;
        }
        for (let patient of this._patients) {
          /// increment total
          this.stats[0].total += 1;
          /// increment priority total
          this.stats[patient.priority + 1].total += 1;
        }
        /// deliver to subscribers
        for (let subscriber of this.statsSubscribers) {
          subscriber.next(this.stats);
        }
        /// sort 
        this.resort();
        this.ws.isConnected = true;
      });
    return of(this.scene);
  }

  patient$(id: string): Observable<any> {
    return new Observable<any[]>(subscriber => {
      this.patientSubscribers[id] = this.patientSubscribers[id] || [];
      this.patientSubscribers[id].push(subscriber);
      this.fetchPatient(id);
      return () => {
        const index = this.patientSubscribers[id].indexOf(subscriber);
        this.patientSubscribers[id].splice(index, 1);
      };
    });
  }

  private fetchPatient(id: string) {
    if (this.patientSubscribers[id]?.length > 0) {
      this.api.patients.get(id).subscribe(res => {
        const patient = res.body;
        for (let subscriber of this.patientSubscribers[id]) {
          subscriber.next(patient);
        }
      });
    }
  }

  private resort() {
    switch (this._sort) {
    case 'priority':
      this._patients = orderBy(this._patients, ['priority'], ['asc']);
      break;
    case 'recent':
      this._patients = orderBy(this._patients, ['updatedAt'], ['desc']);
      break;
    case 'longest':
      this._patients = orderBy(this._patients, ['updatedAt'], ['asc']);
      break;
    case 'az':
      this._patients = orderBy(this._patients, ['firstName'], ['asc']);
      break;
    case 'za':
      this._patients = orderBy(this._patients, ['firstName'], ['desc']);
      break;
    }
    /// deliver to subscribers
    for (let subscriber of this.patientsSubscribers) {
      subscriber.next(this._patients);
    }
  }
}
