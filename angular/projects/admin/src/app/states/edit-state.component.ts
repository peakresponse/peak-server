import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { FormComponent, ApiService, NavigationService } from 'shared';

@Component({
  templateUrl: './edit-state.component.html',
})
export class EditStateComponent {
  id: string = '';
  status: string = '';
  isConfiguring = false;
  isError = false;
  @ViewChild('form') form?: FormComponent;

  constructor(private api: ApiService, private navigation: NavigationService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.poll();
  }

  onDelete() {
    this.navigation.backTo(`/states`);
  }

  onConfigure() {
    this.isConfiguring = true;
    this.isError = false;
    this.api.states.configure(this.id).subscribe(() => {
      this.poll();
    });
  }

  poll() {
    setTimeout(() => {
      this.api.states
        .get(this.id)
        .pipe(
          catchError((res) => {
            this.status = res.headers.get('X-Status');
            this.isConfiguring = false;
            this.isError = true;
            return EMPTY;
          })
        )
        .subscribe((res) => {
          this.status = res.headers.get('X-Status');
          const statusCode = res.headers.get('X-Status-Code');
          if (statusCode === '202') {
            this.isConfiguring = true;
            this.isError = false;
            this.poll();
          } else {
            this.isConfiguring = false;
            if (statusCode && statusCode !== '200') {
              this.isError = true;
            } else {
              this.form?.refresh();
            }
          }
        });
    }, 1000);
  }
}
