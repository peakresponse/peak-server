import { Component, Input } from '@angular/core';

@Component({
  selector: 'admin-interfaces-screen-form',
  templateUrl: './interface-screen-form.component.html',
  standalone: false,
})
export class InterfaceScreenFormComponent {
  @Input() record: any = null;
  @Input() error: any = null;
}
