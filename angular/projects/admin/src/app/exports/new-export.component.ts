import { Component, ViewChild } from '@angular/core';
import { NavigationService } from 'shared';

@Component({
  templateUrl: './new-export.component.html',
})
export class NewExportComponent {
  constructor(private navigation: NavigationService) {}

  onCreate(record: any) {
    this.navigation.replaceWith(`/exports`);
  }
}
