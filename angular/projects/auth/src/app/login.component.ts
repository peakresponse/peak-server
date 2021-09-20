import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { EMPTY, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiService } from 'shared';

@Component({
  templateUrl: './login.component.html',
})
export class LoginComponent {
  data = {
    email: '',
    password: '',
  };
  isLoading = false;

  constructor(private api: ApiService, private route: ActivatedRoute) {}

  get isValid(): boolean {
    return this.data.email && this.data.password ? true : false;
  }

  onSubmit($event: Event) {
    $event.preventDefault();
    this.isLoading = true;
    this.api.auth
      .login(this.data)
      .pipe(
        catchError((error: any, caught: Observable<any>) => {
          this.isLoading = false;
          return EMPTY;
        })
      )
      .subscribe((response: any) => {
        this.isLoading = false;
        const redirectURI = this.route.snapshot.queryParamMap.get('redirectURI') || '/';
        window.location.href = redirectURI;
      });
  }
}
