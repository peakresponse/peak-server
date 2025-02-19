import { Component, ViewChild } from '@angular/core';
import { NavigationService } from 'shared';

@Component({
  templateUrl: './new-region.component.html',
  standalone: false,
})
export class NewRegionComponent {
  constructor(private navigation: NavigationService) {}

  onCreate(record: any) {
    this.navigation.replaceWith(`/regions`);
  }
}
