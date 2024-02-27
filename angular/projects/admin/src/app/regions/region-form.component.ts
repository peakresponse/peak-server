import { Component, Input } from '@angular/core';

@Component({
  selector: 'admin-regions-form',
  templateUrl: './region-form.component.html',
})
export class RegionFormComponent {
  @Input() record: any = null;
  @Input() error: any = null;
}
