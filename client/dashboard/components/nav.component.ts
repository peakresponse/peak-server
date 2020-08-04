import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dashboard-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {
  @Input() scene: any = null;
}
