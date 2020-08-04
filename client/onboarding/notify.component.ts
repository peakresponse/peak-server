import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { empty } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiService, NavigationService } from '../shared/services';
import { AppService } from './app.service';

@Component({
  templateUrl: './notify.component.html',
  styleUrls: ['./notify.component.scss']
})
export class NotifyComponent {
  @ViewChild('firstEl') firstEl: ElementRef;

  isLoading = false;
  isDone = false;
  reason: string = null;
  state: string = null;
  agency: string = null;
  data = {
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  };  

  constructor(private app: AppService, private api: ApiService, private navigation: NavigationService, private route: ActivatedRoute) {
    this.reason = this.route.snapshot.queryParamMap.get('reason');
    this.agency = this.route.snapshot.queryParamMap.get('agency');
    this.state = this.route.snapshot.queryParamMap.get('state');
  }

  get isValid() {
    return this.data.firstName != '' &&
      this.data.lastName != '' &&
      this.data.email != '';
  }

  ngOnInit() {
    setTimeout(() => this.firstEl ? this.firstEl.nativeElement.focus() : null, 100);
  }

  onBack() {
    if (this.reason == 'state') {
      this.navigation.backTo('/state');
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
      this.api.home.contact(this.data)
        .pipe(
          catchError(res => {
            this.isLoading = false;
            return empty();
          })
        )
        .subscribe(res => {
          this.isLoading = false;
          this.isDone = true;
        });      
    }
    return false;
  }
}
