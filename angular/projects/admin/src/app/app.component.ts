import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import sharedTranslationsEN from '../../../shared/src/locales/en.json';
import appTranslationsEN from '../locales/en.json';

import { AgencyService, NotificationService, UserService } from 'shared';

@Component({
  selector: 'admin-root',
  templateUrl: './app.component.html',
  standalone: false,
})
export class AppComponent {
  constructor(
    public currentAgency: AgencyService,
    public currentUser: UserService,
    public notification: NotificationService,
    public translate: TranslateService,
  ) {
    translate.setTranslation('en', { ...sharedTranslationsEN, ...appTranslationsEN });
    translate.use('en');
  }
}
