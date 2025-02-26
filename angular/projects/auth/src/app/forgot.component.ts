import { Component } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { EMPTY, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiService } from 'shared';

@Component({
  templateUrl: './forgot.component.html',
  standalone: false,
})
export class ForgotComponent {
  data = {
    email: '',
  };
  success: any = null;
  error: any = null;
  isLoading = false;

  constructor(private api: ApiService) {}

  get isValid(): boolean {
    return this.data.email ? true : false;
  }

  onSubmit($event: Event) {
    $event.preventDefault();
    this.isLoading = true;
    this.error = null;
    this.api.auth
      .forgot(this.data)
      .pipe(
        catchError((response: HttpErrorResponse, caught: Observable<any>) => {
          this.isLoading = false;
          this.error = response.error;
          return EMPTY;
        }),
      )
      .subscribe((response: HttpResponse<any>) => {
        this.success = response.body;
      });
  }
}
