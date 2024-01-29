import { Component, ViewChild } from '@angular/core';
import { NavigationService } from 'shared';

@Component({
  templateUrl: './new-guide.component.html',
})
export class NewGuideComponent {
  constructor(private navigation: NavigationService) {}

  onCreate(record: any) {
    this.navigation.replaceWith(`/guides`);
  }
}
