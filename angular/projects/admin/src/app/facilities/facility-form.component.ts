import { Component, Input } from '@angular/core';

@Component({
  selector: 'admin-facilities-form',
  templateUrl: './facility-form.component.html',
  standalone: false,
})
export class FacilityFormComponent {
  @Input() record: any;
  @Input() error: any;
}
