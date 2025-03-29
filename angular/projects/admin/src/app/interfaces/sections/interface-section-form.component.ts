import { Component, Input } from '@angular/core';

@Component({
  selector: 'admin-interfaces-section-form',
  templateUrl: './interface-section-form.component.html',
  standalone: false,
})
export class InterfaceSectionFormComponent {
  @Input() record: any = null;
  @Input() error: any = null;
}
