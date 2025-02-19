import { Component, Input } from '@angular/core';

@Component({
  selector: 'admin-guides-form',
  templateUrl: './guide-form.component.html',
  standalone: false,
})
export class GuideFormComponent {
  @Input() record: any = null;
  @Input() error: any = null;
}
