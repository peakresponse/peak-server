import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ApiService, ModalComponent, NavigationService } from 'shared';

@Component({
  templateUrl: './new-client.component.html',
})
export class NewClientComponent {
  @ViewChild('showSecret') showSecret?: ModalComponent;
  client: any;

  constructor(private api: ApiService, private navigation: NavigationService, private route: ActivatedRoute) {}

  onCreate(client: any) {
    this.client = client;
    this.showSecret?.show();
  }

  onConfirm() {
    this.navigation.replaceWith(`/clients/${this.client.id}`);
  }
}
