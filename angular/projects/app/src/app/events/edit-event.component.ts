import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { DateTime } from 'luxon';

import { FormComponent, ModalComponent, NavigationService, TextFieldComponent } from 'shared';

@Component({
  templateUrl: './edit-event.component.html',
  standalone: false,
})
export class EditEventComponent implements OnInit {
  id: string = '';
  @ViewChild('form') form?: FormComponent;
  @ViewChild('newFacilityModal') newFacilityModal?: ModalComponent;
  @ViewChild('editFacilityModal') editFacilityModal?: ModalComponent;
  @ViewChild('inventoryNameField') inventoryNameField?: TextFieldComponent;
  isEditing = false;

  constructor(
    public route: ActivatedRoute,
    public navigation: NavigationService,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
  }

  onCancel() {
    this.navigation.backTo('/events');
  }

  preTransformRecord(record: any) {
    if (record.startTime) {
      record.startTime = DateTime.fromISO(record.startTime).toISO();
      if (record.startTime.includes('.')) {
        record.startTime = record.startTime.substring(0, record.startTime.indexOf('.'));
      }
    }
    if (record.endTime) {
      record.endTime = DateTime.fromISO(record.endTime).toISO();
      if (record.endTime.includes('.')) {
        record.endTime = record.endTime.substring(0, record.endTime.indexOf('.'));
      }
    }
    return record;
  }

  transformRecord(record: any) {
    if (record.startTime) {
      record.startTime = DateTime.fromISO(record.startTime, { zone: 'local' }).toISO();
    }
    if (record.endTime) {
      record.endTime = DateTime.fromISO(record.endTime, { zone: 'local' }).toISO();
    }
    return record;
  }

  onUpdate(record: any) {
    this.navigation.backTo('/events');
  }

  onCreateVenue(record: any) {
    if (this.form) {
      this.form.record = { ...this.form.record, venueId: record.id };
    }
  }

  params(record: any) {
    return new HttpParams().set('venueId', record?.venueId);
  }

  editingFacilityId: string | null = null;

  onClickFacility(record: any) {
    this.editingFacilityId = record.id;
    this.editFacilityModal?.open();
  }

  onCreateFacility(record: any) {
    this.form?.refresh();
    this.newFacilityModal?.close();
  }

  onUpdateFacility(record: any) {
    this.form?.refresh();
    this.editFacilityModal?.close();
  }
}
