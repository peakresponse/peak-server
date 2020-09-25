import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ApiService, NavigationService } from '../../shared/services';

@Component({
  templateUrl: './edit-state.component.html',
})
export class EditStateComponent {
  id: string = null;
  status: string = null;
  isConfiguring = false;

  constructor(
    private api: ApiService,
    private navigation: NavigationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
  }

  onDelete() {
    this.navigation.backTo(`/states`);
  }

  onConfigure() {
    this.isConfiguring = true;
    this.api.states.configure(this.id).subscribe(() => {
      this.poll();
    });
  }

  poll() {
    setTimeout(() => {
      this.api.states.get(this.id).subscribe((res) => {
        if (res.status == 202) {
          this.status = res.headers.get('X-Status');
          this.poll();
        } else {
          this.isConfiguring = false;
        }
      });
    }, 1000);
  }
}
