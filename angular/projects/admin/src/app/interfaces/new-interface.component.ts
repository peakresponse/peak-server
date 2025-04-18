import { Component } from '@angular/core';
import { NavigationService } from 'shared';

@Component({
  templateUrl: './new-interface.component.html',
  standalone: false,
})
export class NewInterfaceComponent {
  constructor(private navigation: NavigationService) {}

  onCreate(record: any) {
    this.navigation.replaceWith(`/interfaces`);
  }
}
