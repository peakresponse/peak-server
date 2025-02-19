import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiService, NavigationService, TextFieldComponent } from 'shared';
import { AppService } from './app.service';

@Component({
  templateUrl: './notify.component.html',
  standalone: false,
})
export class NotifyComponent {
  @ViewChild('firstEl') firstEl?: TextFieldComponent;

  isLoading = false;
  isDone = false;
  reason: string | null = null;
  state: string | null = null;
  agency: string | null = null;
  data = {
    firstName: '',
    lastName: '',
    email: '',
    message: '',
  };
  errors: any = null;

  constructor(
    private app: AppService,
    private api: ApiService,
    private navigation: NavigationService,
    private route: ActivatedRoute,
  ) {
    this.reason = this.route.snapshot.queryParamMap.get('reason');
    this.agency = this.route.snapshot.queryParamMap.get('agency');
    this.state = this.route.snapshot.queryParamMap.get('state');
  }

  get isValid() {
    return this.data.firstName != '' && this.data.lastName != '' && this.data.email != '';
  }

  ngOnInit() {
    setTimeout(() => this.firstEl?.focus(), 100);
  }

  onBack() {
    if (this.reason == 'state') {
      this.navigation.backTo('/state');
    } else if (this.reason == 'agency') {
      this.navigation.backTo('/agency');
    }
  }

  onCancel() {
    window.location.href = `${window.location.protocol}//${window.location.host}`;
  }

  onDone() {
    window.location.href = `${window.location.protocol}//${window.location.host}`;
  }

  onSubmit() {
    if (this.isValid && !this.isLoading) {
      this.isLoading = true;
      this.data.message = `Sign-up Flow\n\nState: ${this.state}\n`;
      if (this.agency) {
        this.data.message = `${this.data.message}Agency: ${this.agency}\n`;
      }
      this.api.home
        .contact(this.data)
        .pipe(
          catchError((res) => {
            this.isLoading = false;
            return EMPTY;
          }),
        )
        .subscribe((res) => {
          this.isLoading = false;
          this.isDone = true;
        });
    }
    return false;
  }
}
