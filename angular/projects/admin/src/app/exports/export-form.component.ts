import { Component, Input } from '@angular/core';

@Component({
  selector: 'admin-exports-form',
  templateUrl: './export-form.component.html',
  standalone: false,
})
export class ExportFormComponent {
  @Input() record: any = null;
  @Input() error: any = null;
}
