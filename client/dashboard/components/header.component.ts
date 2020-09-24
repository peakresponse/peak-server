import { Component, Input } from '@angular/core';
import { UserService } from '../../shared/services';

@Component({
  selector: 'app-dashboard-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Input() scene: any = null;
  @Input() agency: any = null;
  @Input() backLink: any = null;
  @Input() backLabel: string = null;

  constructor(public user: UserService) {}
}
