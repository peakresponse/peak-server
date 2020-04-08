import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import find from 'lodash/find';

import { ApiService, NavigationService } from '../../shared/services';

@Component({
  templateUrl: './new-state.component.html'
})
export class NewStateComponent {
  repos: any = null;

  disabled = false;
  status: string = '';

  constructor(private api: ApiService, private navigation: NavigationService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.api.states.new().subscribe(res => this.repos = res.body);
  }

  onSelectRepo(record: any, value: any) {
    record.repo = value;
    record.name = find(this.repos.values, {slug: value})['name'];
  }

  onCreate(state: any) {
    this.disabled = true;
    /// start polling for data import completion
    console.log(state);
    this.poll(state.id);
  }

  poll(id: string) {
    setTimeout(() => {
      this.api.states.get(id)
        .subscribe(res => {
          if (res.status == 202) {
            this.status = res.headers.get('X-Status');
            this.poll(id);
          } else {
            this.navigation.replaceWith(`/states/${id}`);
          }
        });
    }, 1000);
  }
}
