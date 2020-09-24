import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-dashboard-patient-row',
  templateUrl: './patient-row.component.html',
  styleUrls: ['./patient-row.component.scss'],
})
export class PatientRowComponent {
  @Input() patient: any = null;
  @Input() now: Date;
  @Output() click = new EventEmitter<any>();

  onClick() {
    this.click.emit(this.patient);
  }
}
