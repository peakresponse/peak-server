import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ApiService, ModalComponent } from 'shared';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpParams, HttpResponse } from '@angular/common/http';

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

  searchHandler: (search: string) => Observable<any[]> = (search: string) =>
    this.api.venues.index(new HttpParams().set('search', search)).pipe(map((response: HttpResponse<any>) => response.body?.Venue ?? []));

  constructor(private api: ApiService) {}

  onNewVenue() {
    this.newVenueModal?.show(null, { centered: true, size: 'md' });
  }

  onCreateVenue(record: any) {
    this.createVenue.emit(record);
    this.newVenueModal?.close();
  }
}
