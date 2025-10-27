import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { cloneDeep } from 'lodash-es';

import { ModalComponent } from 'shared';

@Component({
  selector: 'admin-regions-facility-form',
  templateUrl: './region-facility-form.component.html',
  standalone: false,
})
export class RegionFacilityFormComponent {
  @Input() isEditing = false;
  @Input() record: any = {};
  @Input() error: any = null;
  @Output() onConfirm = new EventEmitter<any>();

  @ViewChild('modal') modal?: ModalComponent;

  designations = [
    { value: '4224003', label: 'Adult Trauma' },
    { value: '4224005', label: 'Cardiac Arrest' },
    { value: '4224007', label: 'Obstetrics' },
    { value: '4224009', label: 'Other' },
    { value: '4224011', label: 'Pediatric Trauma' },
    { value: '4224013', label: 'STEMI' },
    { value: '4224015', label: 'Stroke' },
    { value: '4224017', label: 'Trauma (General)' },
    { value: '4224019', label: 'Sepsis' },
  ];

  labelFor(value: string): string | undefined {
    return this.designations.find((d) => d.value === value)?.label;
  }

  show(record?: any): void {
    if (record) {
      this.record = cloneDeep(record);
    }
    this.modal?.show(null, { centered: true, size: 'lg' });
  }

  onConfirmInternal(): void {
    this.onConfirm.emit(this.record);
    this.modal?.close();
    this.record = {};
  }
}
