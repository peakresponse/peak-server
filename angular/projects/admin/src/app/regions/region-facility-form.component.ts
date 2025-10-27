import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { cloneDeep } from 'lodash-es';

import { ModalComponent, SchemaService } from 'shared';

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

  designations: any[] = [];

  constructor(private schema: SchemaService) {}

  ngOnInit(): void {
    this.schema.get('/nemsis/xsd/eDisposition_v3.json').subscribe(() => {
      const designationsMap = this.schema.getEnum('DestinationPrearrivalActivation');
      this.designations = Object.entries(designationsMap).map(([value, label]) => ({ value, label }));
    });
  }

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
