import { Component, ElementRef, ViewChild } from '@angular/core';

import { ApiService, NavigationService, SelectFieldComponent } from 'shared';
import { AppService } from './app.service';

@Component({
  templateUrl: './state.component.html',
})
export class StateComponent {
  @ViewChild('stateEl') stateEl?: SelectFieldComponent;

  states: any[] = [];
  data: any = {
    state: null,
  };

  constructor(private app: AppService, private api: ApiService, private navigation: NavigationService) {}

  ngOnInit() {
    this.api.states.index().subscribe((res) => (this.states = res.body));
    setTimeout(() => this.stateEl?.focus(), 100);
  }

  onBack() {
    this.navigation.backTo('/welcome');
  }

  onCancel() {
    window.location.href = `${window.location.protocol}//${window.location.host}`;
  }

  onNext() {
    if (this.data.state) {
      this.app.state = this.data.state;
      if (this.data.state.isConfigured) {
        this.navigation.goTo('/agency', { stateId: this.data.state.id });
      } else {
        console.log(this.data.state);
        this.navigation.goTo('/notify', {
          reason: 'state',
          state: this.data.state.name,
        });
      }
    }
  }
}
