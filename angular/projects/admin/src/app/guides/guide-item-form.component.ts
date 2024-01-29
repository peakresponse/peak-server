import { Component, Input } from '@angular/core';

@Component({
  selector: 'admin-guides-item-form',
  templateUrl: './guide-item-form.component.html',
})
export class GuideItemFormComponent {
  @Input() record: any = null;
  @Input() error: any = null;
}
