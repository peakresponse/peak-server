import { Component, Input } from '@angular/core';

@Component({
  selector: 'admin-interfaces-form',
  templateUrl: './interface-form.component.html',
  standalone: false,
})
export class InterfaceFormComponent {
  @Input() record: any = null;
  @Input() error: any = null;
}
