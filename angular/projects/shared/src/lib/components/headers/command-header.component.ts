import { Component, Input } from '@angular/core';

@Component({
  selector: 'shared-command-header',
  templateUrl: './command-header.component.html',
})
export class CommandHeaderComponent {
  @Input() user?: any;
}
