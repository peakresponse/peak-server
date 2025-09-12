import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { DateTime } from 'luxon';

import { FormComponent, ModalComponent, NavigationService, TextFieldComponent } from 'shared';

import { Event } from '../models/event';
import models from '../models';

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
    this.navigation.backTo(`/events/${this.id}`);
  }

  preTransformRecord(record: any) {
    let data: any = {};
    for (const key of Object.keys(record)) {
      data[key] = {};
      if (record[key]) {
        for (const obj of Array.isArray(record[key]) ? record[key] : [record[key]]) {
          data[key][obj.id] = obj;
        }
      }
    }
    let event = new Event(record.Event, data, models) as any;
    if (event.startTime) {
      event.startTime = DateTime.fromISO(event.startTime).toISO();
      if (event.startTime.includes('.')) {
        event.startTime = event.startTime.substring(0, event.startTime.indexOf('.'));
      }
    }
    if (event.endTime) {
      event.endTime = DateTime.fromISO(event.endTime).toISO();
      if (event.endTime.includes('.')) {
        event.endTime = event.endTime.substring(0, event.endTime.indexOf('.'));
      }
    }
    return event;
  }

  transformRecord(record: any) {
    if (record.startTime) {
      record.startTime = DateTime.fromISO(record.startTime, { zone: 'local' }).toISO();
    }
    if (record.endTime) {
      record.endTime = DateTime.fromISO(record.endTime, { zone: 'local' }).toISO();
    }
    return record.data;
  }

  onUpdate(record: any) {
    this.form?.refresh();
    this.isEditing = false;
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
