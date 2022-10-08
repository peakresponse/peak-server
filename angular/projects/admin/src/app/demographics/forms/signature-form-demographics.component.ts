import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

import { cloneDeep } from 'lodash';

import { ModalComponent, SchemaService } from 'shared';

@Component({
  selector: 'admin-demographics-form-signature',
  templateUrl: './signature-form-demographics.component.html',
})
export class SignatureFormDemographicsComponent implements OnInit {
  @Input() isEditing = false;
  @Input() record: any = {};
  @Input() error: any = null;
  @Output() onConfirm = new EventEmitter<any>();

  @ViewChild('modal') modal?: ModalComponent;

  signatureTypes: any = {};

  constructor(private schema: SchemaService) {}

  ngOnInit(): void {
    this.schema.get('/nemsis/xsd/eOther_v3.json').subscribe(() => {
      this.signatureTypes = this.schema.getEnum('SignatureType') ?? [];
    });
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
