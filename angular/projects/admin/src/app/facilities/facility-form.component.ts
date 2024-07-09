import { Component, Input } from '@angular/core';

@Component({
  selector: 'admin-facilities-form',
  templateUrl: './facility-form.component.html',
})
export class FacilityFormComponent {
  @Input() record: any;
  @Input() error: any;
}
