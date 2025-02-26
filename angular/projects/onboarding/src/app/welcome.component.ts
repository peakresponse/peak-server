import { Component } from '@angular/core';

import { NavigationService } from 'shared';

@Component({
  templateUrl: './welcome.component.html',
  standalone: false,
})
export class WelcomeComponent {
  isMarketingEnabled = false;

  constructor(private navigation: NavigationService) {
    // this.isMarketingEnabled = window['env'].MARKETING_ENABLED === 'true';
  }

  onBack() {
    window.location.href = `${window.location.protocol}//${window.location.host}`;
  }

  onNext() {
    this.navigation.goTo('/state');
  }
}
