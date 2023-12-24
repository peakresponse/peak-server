import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ApiService, NavigationService } from 'shared';

@Component({
  templateUrl: './edit-psap-dispatcher.component.html',
})
export class EditPsapDispatcherComponent {
  id: string = '';

  constructor(
    private api: ApiService,
    private navigation: NavigationService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params.id;
  }

  onUpdate() {
    this.navigation.backTo(`/psaps/${this.route.snapshot.params.psapId}/dispatchers`);
  }
}
