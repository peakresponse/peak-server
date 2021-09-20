import { Component } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { EMPTY, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiService } from 'shared';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './reset.component.html',
})
export class ResetComponent {
  data = {
    password: '',
  };
  success: any = null;
  error: any = null;
  isLoading = false;

  constructor(private api: ApiService, private route: ActivatedRoute) {}

  get isValid(): boolean {
    return this.data.password ? true : false;
  }

  onSubmit($event: Event) {
    $event.preventDefault();
    const token = this.route.snapshot.paramMap.get('token') ?? '';
    this.isLoading = true;
    this.error = null;
    this.api.auth
      .reset(token, this.data)
      .pipe(
        catchError((response: HttpErrorResponse, caught: Observable<any>) => {
          this.isLoading = false;
          this.error = response.error;
          return EMPTY;
        })
      )
      .subscribe((response: HttpResponse<any>) => {
        this.success = response.body;
      });
  }
}
