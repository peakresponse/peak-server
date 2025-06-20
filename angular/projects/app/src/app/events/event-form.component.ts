import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ModalComponent, ObjectFieldComponent } from 'shared';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  standalone: false,
})
export class EventFormComponent {
  @Input() record: any = null;
  @Input() error: any = null;
  @Output() createVenue = new EventEmitter<any>();

  @ViewChild('newVenueModal') newVenueModal?: ModalComponent;

  onNewVenue() {
    this.newVenueModal?.show(null, { centered: true, size: 'md' });
  }

  onCreateVenue(record: any) {
    this.createVenue.emit(record);
    this.newVenueModal?.close();
  }
}
