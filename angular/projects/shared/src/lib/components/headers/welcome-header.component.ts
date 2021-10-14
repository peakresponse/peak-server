import { Component, Input } from '@angular/core';

@Component({
  selector: 'shared-welcome-header',
  templateUrl: './welcome-header.component.html',
})
export class WelcomeHeaderComponent {
  @Input() user?: any;
}
