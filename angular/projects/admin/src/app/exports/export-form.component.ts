import { Component, Input } from '@angular/core';

@Component({
  selector: 'admin-exports-form',
  templateUrl: './export-form.component.html',
})
export class ExportFormComponent {
  @Input() record: any = null;
  @Input() error: any = null;
}
