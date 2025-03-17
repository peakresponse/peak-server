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
  groupModalValue: any;

  showGroupModal(modal: ModalComponent, index?: number) {
    this.groupModalRecord = cloneDeep(this.record);
    if (Number.isInteger(index)) {
      this.groupModalIndex = index;
      let path = this.path;
      if (this.xsd?.isGrouped) {
        path = path.replace(this.xsd?.basePath ?? '$', '$');
      }
      this.groupModalValue = JSONPath({ path: `${path}[${index}]`, json: this.groupModalRecord.data, wrap: false });
      if (!this.groupModalValue && index === 0) {
        this.groupModalValue = JSONPath({ path, json: this.groupModalRecord.data, wrap: false });
      }
      this.isGroupModalEditing = true;
    } else {
      this.groupModalIndex = this.values?.length ?? 0;
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
