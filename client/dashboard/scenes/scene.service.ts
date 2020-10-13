import { Injectable, OnDestroy } from '@angular/core';

import { Observable, of, Subscription, ReplaySubject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

import assign from 'lodash/assign';
import find from 'lodash/find';
import orderBy from 'lodash/orderBy';
import remove from 'lodash/remove';
import moment from 'moment';

import { ApiService, WebSocketService } from '../../shared/services';
import { Scene } from './scene';

@Injectable()
export class SceneService implements OnDestroy {
  private scene: any = {};
  private sceneSubscription: Subscription = null;
  private sceneSubject = new ReplaySubject<any>(1);
  private isSceneInitialized = false;

  private _filter: string = null;
  private _sort = 'priority';

  private elapsedTimeIntervalId: any = null;
  private elapsedTimeSubject = new ReplaySubject<string>(1);

  private patients: any[] = [];
  private patientsSubject = new ReplaySubject<any[]>(1);

  private pins: any[] = [];
  private pinsSubject = new ReplaySubject<any[]>(1);

  private responders: any[] = [];
  private respondersSubject = new ReplaySubject<any[]>(1);

  private stats: any[] = Array(7)
    .fill(null)
    .map(() => ({ total: 0, updates: [] }));
  private statsSubject = new ReplaySubject<any[]>(1);

  private patientSubscribers: any = {};

  constructor(private api: ApiService, private ws: WebSocketService) {
    this.elapsedTimeIntervalId = setInterval(() => this.elapsedTimeSubject.next(this.elapsedTime), 1000);
  }

  ngOnDestroy() {
    clearInterval(this.elapsedTimeIntervalId);
    this.sceneSubscription?.unsubscribe();
  }

  get id(): string {
    return this.scene?.id;
  }

  get isActive(): boolean {
    return this.scene?.isActive;
  }

  get attributes(): any {
    return this.scene;
  }

  get attributes$(): Observable<any> {
    return this.sceneSubject;
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
    this.resortAndDispatch();
  }

  get elapsedTime(): string {
    if (this.scene) {
      return moment.utc(moment().diff(moment(this.scene.createdAt))).format('HH:mm:ss');
    }
    return '--:--:--';
  }

  get elapsedTime$(): Observable<string> {
    return this.elapsedTimeSubject;
  }

  get patients$(): Observable<any[]> {
    return this.patientsSubject;
  }

  get pins$(): Observable<any[]> {
    return this.pinsSubject;
  }

  get responders$(): Observable<any[]> {
    return this.respondersSubject;
  }

  get stats$(): Observable<any[]> {
    return this.statsSubject;
  }

  private reset() {
    this.scene = {};
    this._filter = null;
    this._sort = 'priority';

    this.patients = [];
    this.responders = [];
    this.stats = Array(7)
      .fill(null)
      .map(() => ({ total: 0, updates: [] }));

    this.sceneSubject.next(this.scene);
    this.patientsSubject.next(this.patients);
    this.respondersSubject.next(this.responders);
    this.statsSubject.next(this.stats);
  }

  connect(id: string): Observable<boolean> {
    this.sceneSubscription?.unsubscribe();
    this.reset();
    if (id == 'demo') {
      this.scene = new Scene({
        id: 'demo',
        name: 'Demo Scene',
        isActive: true,
        createdAt: new Date(),
      });
      return of(true);
    } else {
      return this.api.scenes.get(id).pipe(
        catchError(() => of(false)),
        tap((res: any) => {
          this.scene = new Scene(res.body);
          this.sceneSubject.next(this.scene);
          this.subscribe(id);
        }),
        map(() => true)
      );
    }
  }

  isOnScene(userId: string): boolean {
    const found = find(this.responders, { user: { id: userId } } as any);
    return found && !found.departedAt;
  }

  close(): Observable<any> {
    return this.api.scenes.close(this.id);
  }

  join(): Observable<any> {
    return this.api.scenes.join(this.id);
  }

  addPin(pin: any): Observable<any> {
    this.pins.push(pin);
    this.pinsSubject.next(this.pins);
    return this.api.scenes.addPin(this.id, pin);
  }

  removePin(pin: any): Observable<any> {
    remove(this.pins, { id: pin.id });
    this.pinsSubject.next(this.pins);
    return this.api.scenes.removePin(this.id, pin.id);
  }

  leave(): Observable<any> {
    return this.api.scenes.leave(this.id);
  }

  transfer(userId: string, agencyId: string): Observable<any> {
    return this.api.scenes.transfer(this.id, userId, agencyId);
  }

  disconnect() {
    this.sceneSubscription?.unsubscribe();
    this.sceneSubscription = null;
    this.ws.close();
  }

  private subscribe(id: string) {
    this.disconnect();
    this.sceneSubscription = this.ws.connect(`/scene?id=${id}`).subscribe((data) => {
      if (data.scene) {
        this.scene = new Scene(data.scene);
        this.sceneSubject.next(this.scene);
      }
      if (data.responders) {
        for (let responder of data.responders) {
          const found = find(this.responders, {
            user: { id: responder.user.id },
          });
          if (!found) {
            this.responders.push(responder);
          } else {
            assign(found, responder);
          }
        }
        this.respondersSubject.next(this.responders);
      }
      if (data.pins) {
        for (let record of data.pins) {
          if (record.deletedAt) {
            remove(this.pins, { id: record.id });
          } else {
            const found = find(this.pins, { id: record.id });
            if (!found) {
              this.pins.push(record);
            } else {
              assign(found, record);
            }
          }
        }
        this.pinsSubject.next(this.pins);
      }
      if (data.patients) {
        /// process new records
        for (let record of data.patients) {
          const found = find(this.patients, { id: record.id });
          if (!found) {
            this.patients.push(record);
          } else {
            assign(found, record);
          }
          if (this.isSceneInitialized) {
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
          if (this.patientSubscribers[record.id]?.length > 0) {
            for (let subscriber of this.patientSubscribers[record.id]) {
              subscriber.next(record);
            }
          }
        }
        this.isSceneInitialized = true;
        /// reset and update stats
        for (let stat of this.stats) {
          stat.total = 0;
        }
        for (let patient of this.patients) {
          /// increment total
          this.stats[0].total += 1;
          /// increment priority total
          this.stats[patient.priority + 1].total += 1;
        }
        /// dispatch stats to subscribers
        this.statsSubject.next(this.stats);
        /// sort and dispatch updates
        this.resortAndDispatch();
      }
    });
  }

  patient$(id: string): Observable<any> {
    return new Observable<any[]>((subscriber) => {
      this.patientSubscribers[id] = this.patientSubscribers[id] || [];
      this.patientSubscribers[id].push(subscriber);
      for (let patient of this.patients) {
        if (patient.id == id) {
          subscriber.next(patient);
          break;
        }
      }
      return () => {
        const index = this.patientSubscribers[id].indexOf(subscriber);
        this.patientSubscribers[id].splice(index, 1);
        if (this.patientSubscribers[id].length == 0) {
          delete this.patientSubscribers[id];
        }
      };
    });
  }

  private resortAndDispatch() {
    switch (this._sort) {
      case 'priority':
        this.patients = orderBy(this.patients, ['priority'], ['asc']);
        break;
      case 'recent':
        this.patients = orderBy(this.patients, ['updatedAt'], ['desc']);
        break;
      case 'longest':
        this.patients = orderBy(this.patients, ['updatedAt'], ['asc']);
        break;
      case 'az':
        this.patients = orderBy(this.patients, ['firstName'], ['asc']);
        break;
      case 'za':
        this.patients = orderBy(this.patients, ['firstName'], ['desc']);
        break;
    }
    /// dispatch to subscribers
    this.patientsSubject.next(this.patients);
  }
}
