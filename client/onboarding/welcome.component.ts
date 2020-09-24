import { Component } from '@angular/core';

import { NavigationService } from '../shared/services';

@Component({
  templateUrl: './welcome.component.html',
})
export class WelcomeComponent {
  constructor(private navigation: NavigationService) {}

  onBack() {
    window.location.href = `${window.location.protocol}//${window.location.host}`;
  }

  onNext() {
    this.navigation.goTo('/state');
  }
}
