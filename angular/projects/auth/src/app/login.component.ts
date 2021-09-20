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
  error: any = null;
  isLoading = false;

  constructor(private api: ApiService, private route: ActivatedRoute) {}

  get isValid(): boolean {
    return this.data.email && this.data.password ? true : false;
  }

  onSubmit($event: Event) {
    $event.preventDefault();
    this.isLoading = true;
    this.error = null;
    this.api.auth
      .login(this.data)
      .pipe(
        catchError((error: any, caught: Observable<any>) => {
          this.isLoading = false;
          this.error = {
            messages: [
              {
                path: 'email',
              },
              {
                path: 'password',
                message: 'Invalid email and/or password.',
              },
            ],
          };
          return EMPTY;
        })
      )
      .subscribe((response: any) => {
        const redirectURI = this.route.snapshot.queryParamMap.get('redirectURI') || '/';
        window.location.href = redirectURI;
      });
  }
}
