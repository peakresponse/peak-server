import { HttpParams } from '@angular/common/http';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'admin-users-employment-form',
  templateUrl: './employment-form.component.html',
  standalone: false,
})
export class EmploymentFormComponent {
  @Input() record: any = null;
  @Input() error: any = null;
}
