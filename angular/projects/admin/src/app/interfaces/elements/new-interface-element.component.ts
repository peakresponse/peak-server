import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { pick } from 'lodash-es';

import { NavigationService } from 'shared';

@Component({
  templateUrl: './new-interface-element.component.html',
  standalone: false,
})
export class NewInterfaceElementComponent implements OnInit {
  sectionId: string = '';
  screenId: string = '';
  interfaceId: string = '';

  constructor(
    private navigation: NavigationService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.sectionId = this.route.snapshot.parent?.params['id'];
    this.screenId = this.route.snapshot.parent?.parent?.params['id'];
    this.interfaceId = this.route.snapshot.parent?.parent?.parent?.params['id'];
  }

  transformRecord = (record: any) => ({
    ...pick(record, ['nemsisElementId', 'screenId', 'position', 'column', 'customId']),
    sectionId: this.sectionId,
  });

  onCreate(record: any) {
    this.navigation.backTo(`/interfaces/${this.interfaceId}/screens/${this.screenId}/sections/${this.sectionId}`);
  }
}
