import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { FormComponent, ApiService, NavigationService } from 'shared';

@Component({
  templateUrl: './edit-state.component.html',
})
export class EditStateComponent {
  id: string = '';
  status: string = '';
  states?: any[];
  isConfiguring = false;
  isError = false;
  @ViewChild('form') form?: FormComponent;

  repo: any;
  isRepoInitializing = false;

  constructor(private api: ApiService, private navigation: NavigationService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.api.states.index().subscribe((response: HttpResponse<any>) => {
      this.states = response.body;
    });
    this.api.states.getRepository(this.id).subscribe((response: HttpResponse<any>) => (this.repo = response.body));
    this.poll();
  }

  state(id: string): any {
    return this.states?.find((s) => s.id == id);
  }

  onDelete() {
    this.navigation.backTo(`/states`);
  }

  onRepoInit() {
    this.isRepoInitializing = true;
    this.api.states.initRepository(this.id).subscribe(() => {
      this.pollRepo();
    });
  }

  pollRepo() {
    setTimeout(() => {
      this.api.states.getRepository(this.id).subscribe((response: HttpResponse<any>) => {
        this.repo = response.body;
        if (this.repo?.initialized) {
          this.isRepoInitializing = false;
        } else {
          this.pollRepo();
        }
      });
    }, 1000);
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
