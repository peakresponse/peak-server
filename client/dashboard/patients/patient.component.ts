import { Component, EventEmitter, Input, Output } from '@angular/core';
import clone from 'lodash/clone';

@Component({
  selector: 'app-dashboard-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.scss']
})
export class PatientComponent {
  @Input() patient: any;
  @Input() now: Date;

  get portraitUrl() {
    if (this.patient.portraitUrl) {
      return `url("${this.patient.portraitUrl}")`;
    }
    return "none"
  }
}
