import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subscription, ReplaySubject } from 'rxjs';
import { findIndex, orderBy } from 'lodash';

import { WebSocket } from '../../shared/services';
import { Scene } from '../scenes/scene';

@Injectable({
  providedIn: 'root',
})
export class AgencyService implements OnDestroy {
  private ws: WebSocket = null;

  private agency: any = null;
  private agencySubscription: Subscription = null;
  private agencySubject = new ReplaySubject<any>(1);
  get attributes$(): Observable<any> {
    return this.agencySubject;
  }

  private activeScenes: any[] = [];
  private activeScenesSubject = new ReplaySubject<any[]>(1);
  get activeScenes$(): Observable<any[]> {
    return this.activeScenesSubject;
  }

  constructor() {
    this.ws = new WebSocket('/agency');
  }

  ngOnDestroy() {
    this.disconnect();
  }

  connect() {
    this.disconnect();
    this.agencySubscription = this.ws.connect().subscribe((data) => {
      this.agency = data.agency;
      this.agencySubject.next(this.agency);
      if (data.scenes.length > 0) {
        data.scenes = data.scenes.map((s: any) => new Scene(s));
        for (let scene of data.scenes) {
          const index = findIndex(this.activeScenes, { id: scene.id });
          if (index >= 0) {
            if (scene.isActive) {
              this.activeScenes[index].update(scene);
            } else {
              this.activeScenes.splice(index, 1);
            }
          } else {
            if (scene.isActive) {
              this.activeScenes.push(scene);
            }
          }
        }
        this.activeScenes = orderBy(this.activeScenes, ['updatedAt'], ['desc']);
      } else {
        this.activeScenes = [];
      }
      this.activeScenesSubject.next(this.activeScenes);
    });
  }

  disconnect() {
    this.agencySubscription?.unsubscribe();
    this.agencySubscription = null;
    this.ws.close();
  }
}
