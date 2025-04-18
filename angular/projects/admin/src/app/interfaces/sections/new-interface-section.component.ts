import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { pick } from 'lodash-es';

import { NavigationService } from 'shared';

@Component({
  templateUrl: './new-interface-section.component.html',
  standalone: false,
})
export class NewInterfaceSectionComponent implements OnInit {
  screenId: string = '';
  interfaceId: string = '';

  constructor(
    private navigation: NavigationService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.screenId = this.route.snapshot.parent?.params['id'];
    this.interfaceId = this.route.snapshot.parent?.parent?.params['id'];
  }

  transformRecord = (record: any) => ({
    ...pick(record, ['name', 'position']),
    screenId: this.screenId,
  });

  onCreate(record: any) {
    this.navigation.backTo(`/interfaces/${this.interfaceId}/screens/${this.screenId}`);
  }
}
