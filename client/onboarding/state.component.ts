import { Component, ElementRef, ViewChild } from '@angular/core';

import { ApiService, NavigationService } from '../shared/services';
import { AppService } from './app.service';

@Component({
  templateUrl: './state.component.html'
})
export class StateComponent {
  @ViewChild('stateEl') stateEl: ElementRef;

  states: any[] = [];
  state: any = null;

  constructor(private app: AppService, private api: ApiService, private navigation: NavigationService) {}

  ngOnInit() {
    this.api.states.index().subscribe(res => this.states = res.body);
    setTimeout(() => this.stateEl ? this.stateEl.nativeElement.focus() : null, 100);
  }

  onBack() {
    this.navigation.backTo('/welcome');
  }

  onCancel() {
    window.location.href = `${window.location.protocol}//${window.location.host}`;
  }

  onNext() {
    if (this.state) {
      this.app.state = this.state;
      if (this.state.isConfigured) {
        this.navigation.goTo('/agency', {stateId: this.state.id});
      } else {
        this.navigation.goTo('/notify', {reason: 'state', state: this.state.name});
      }
    }
  }
}
