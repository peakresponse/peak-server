import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ApiService, NavigationService } from 'shared';

@Component({
  templateUrl: './edit-client.component.html',
})
export class EditClientComponent {
  id: string = '';

  constructor(
    private api: ApiService,
    private navigation: NavigationService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
  }

  onGenerate(client: any) {
    this.api.clients.regenerate(client.id).subscribe((response) => {
      client.clientId = response.body.clientId;
      client.clientSecret = response.body.clientSecret;
    });
  }

  onDelete() {
    this.navigation.backTo(`/clients`);
  }
}
