import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { pick } from 'lodash-es';

import { NavigationService } from 'shared';

@Component({
  templateUrl: './new-export-trigger.component.html',
})
export class NewExportTriggerComponent implements OnInit {
  exportId: string = '';

  constructor(
    private navigation: NavigationService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.exportId = this.route.snapshot.parent?.params['id'];
  }

  transformRecord = (record: any) => ({
    ...pick(record, ['type', 'debounceTime', 'isEnabled', 'username', 'password', 'organization']),
    exportId: this.exportId,
    agencyId: record.agency.claimedAgency?.id,
  });

  onCreate(record: any) {
    this.navigation.replaceWith(`/exports/${this.exportId}`);
  }
}
