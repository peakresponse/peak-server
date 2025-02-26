import { Component, Input } from '@angular/core';

@Component({
  selector: 'shared-welcome-header',
  templateUrl: './welcome-header.component.html',
  standalone: false,
})
export class WelcomeHeaderComponent {
  @Input() user?: any;
}
