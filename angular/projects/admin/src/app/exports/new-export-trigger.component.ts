import { Component, ViewChild } from '@angular/core';
import { NavigationService } from 'shared';

@Component({
  templateUrl: './new-export-trigger.component.html',
})
export class NewExportTriggerComponent {
  constructor(private navigation: NavigationService) {}

  onCreate(record: any) {
    this.navigation.replaceWith(`/exports`);
  }
}
