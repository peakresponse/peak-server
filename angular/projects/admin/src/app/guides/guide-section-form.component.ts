import { Component, Input } from '@angular/core';

@Component({
  selector: 'admin-guides-section-form',
  templateUrl: './guide-section-form.component.html',
  standalone: false,
})
export class GuideSectionFormComponent {
  @Input() record: any = null;
  @Input() error: any = null;
}
