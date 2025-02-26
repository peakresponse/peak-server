import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { pick } from 'lodash-es';

import { NavigationService } from 'shared';

@Component({
  templateUrl: './new-guide-item.component.html',
  standalone: false,
})
export class NewGuideItemComponent implements OnInit {
  guideId: string = '';
  sectionId: string = '';

  constructor(
    private navigation: NavigationService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.sectionId = this.route.snapshot.parent?.params['id'];
    this.guideId = this.route.snapshot.parent?.parent?.params['id'];
  }

  transformRecord = (record: any) => ({
    ...pick(record, ['file', 'body', 'position', 'isVisible']),
    sectionId: this.sectionId,
  });

  onCreate(record: any) {
    this.navigation.backTo(`/guides/${this.guideId}/sections/${this.sectionId}`);
  }
}
