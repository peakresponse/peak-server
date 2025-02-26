import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { pick } from 'lodash-es';

import { NavigationService } from 'shared';

@Component({
  templateUrl: './new-guide-section.component.html',
  standalone: false,
})
export class NewGuideSectionComponent implements OnInit {
  guideId: string = '';

  constructor(
    private navigation: NavigationService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.guideId = this.route.snapshot.parent?.params['id'];
  }

  transformRecord = (record: any) => ({
    ...pick(record, ['name', 'body', 'position', 'isVisible']),
    guideId: this.guideId,
  });

  onCreate(record: any) {
    this.navigation.backTo(`/guides/${this.guideId}`);
  }
}
