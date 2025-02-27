import { Component } from '@angular/core';

import { JSONPath } from 'jsonpath-plus';
import { cloneDeep } from 'lodash-es';
import { v4 as uuid } from 'uuid';

import { XsdElementBaseComponent } from './xsd-element-base.component';

import { ModalComponent } from '../../modal.component';

@Component({
  selector: 'shared-xsd-form-group',
  templateUrl: './xsd-form-group.component.html',
  styleUrls: ['./xsd-form-group.component.scss'],
  standalone: false,
})
export class XsdFormGroupComponent extends XsdElementBaseComponent {
  isGroupModalEditing = false;
  groupModalIndex?: number;
  groupModalRecord: any;
  groupModalPath?: string;
  groupModalValue: any;

  showGroupModal(modal: ModalComponent, index?: number) {
    this.groupModalIndex = index;
    this.groupModalRecord = cloneDeep(this.record);
    let basePath = this.path;
    if (this.xsd?.isGrouped) {
      basePath = basePath.replace(this.xsd?.basePath ?? '$', '$');
    }
    if (Number.isInteger(index)) {
      this.groupModalPath = `${basePath}[${index}]`;
      this.groupModalValue = JSONPath({ path: this.groupModalPath, json: this.groupModalRecord.data, wrap: false });
      if (!this.groupModalValue && index === 0) {
        this.groupModalValue = JSONPath({ path: basePath, json: this.groupModalRecord.data, wrap: false });
      }
      this.isGroupModalEditing = true;
    } else {
      this.groupModalPath = `${basePath}[${this.values?.length ?? 0}]`;
      this.groupModalValue = {};
      if (this.isGroupUUIDRequired) {
        this.groupModalValue._attributes = {
          UUID: uuid(),
        };
      }
      this.isGroupModalEditing = false;
    }
    modal.show(null, { centered: true, size: 'lg' });
  }

  onGroupModalConfirm(modal: ModalComponent) {
    this.record.data = this.groupModalRecord.data;
    if (this.groupModalIndex === undefined) {
      setTimeout(() => this.addValue(this.groupModalValue), 0);
    }
    modal.close();
  }
}
