import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiService, ModalComponent, NavigationService } from 'shared';

@Component({
  templateUrl: './new-client.component.html',
  standalone: false,
})
export class NewClientComponent {
  @ViewChild('showSecret') showSecret?: ModalComponent;
  client: any;

  inputFormatter = (item: any): string => `${item.firstName ?? ''} ${item.lastName ?? ''} <${item.email ?? ''}>`.trim();

  constructor(
    private api: ApiService,
    private navigation: NavigationService,
    private route: ActivatedRoute,
  ) {}

  onCreate(client: any) {
    this.client = client;
    this.showSecret?.show();
  }

  onConfirm() {
    this.showSecret?.close();
    this.navigation.replaceWith(`/clients/${this.client.id}`);
  }
}
