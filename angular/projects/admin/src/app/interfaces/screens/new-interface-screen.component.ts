import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { pick } from 'lodash-es';

import { NavigationService } from 'shared';

@Component({
  templateUrl: './new-interface-screen.component.html',
  standalone: false,
})
export class NewInterfaceScreenComponent implements OnInit {
  interfaceId: string = '';

  constructor(
    private navigation: NavigationService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.interfaceId = this.route.snapshot.parent?.params['id'];
  }

  transformRecord = (record: any) => ({
    ...pick(record, ['name']),
    interfaceId: this.interfaceId,
  });

  onCreate(record: any) {
    this.navigation.backTo(`/interfaces/${this.interfaceId}`);
  }
}
