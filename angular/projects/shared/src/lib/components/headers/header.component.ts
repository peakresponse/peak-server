import { Component, Input } from '@angular/core';

@Component({
  selector: 'shared-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  @Input() user: any = {};
}
