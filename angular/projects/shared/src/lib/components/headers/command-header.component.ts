import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'shared-command-header',
  templateUrl: './command-header.component.html',
})
export class CommandHeaderComponent {
  @Input() user?: any;
  @Input() showSearch = false;
  @Output() searchValueChange = new EventEmitter<string>();
}
