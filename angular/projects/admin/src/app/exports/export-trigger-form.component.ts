import { Component, Input } from '@angular/core';

@Component({
  selector: 'admin-exports-trigger-form',
  templateUrl: './export-trigger-form.component.html',
})
export class ExportTriggerFormComponent {
  @Input() record: any = null;
  @Input() error: any = null;
}
