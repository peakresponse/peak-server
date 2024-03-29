import { Component } from '@angular/core';

import { assign, cloneDeep } from 'lodash-es';
import { v4 as uuid } from 'uuid';

import { XsdElementBaseComponent } from './xsd-element-base.component';

import { ModalComponent } from '../../modal.component';

@Component({
  selector: 'shared-xsd-form-group',
  templateUrl: './xsd-form-group.component.html',
  styleUrls: ['./xsd-form-group.component.scss'],
})
export class XsdFormGroupComponent extends XsdElementBaseComponent {
  isGroupModalEditing = false;
  groupModalPath?: string;
  groupModalValue: any = null;

  showGroupModal(modal: ModalComponent, selectedValue?: any, index?: number) {
    this.selectedValue = selectedValue;
    if (selectedValue) {
      this.groupModalPath = `${this.path}[${index}]`;
      this.groupModalValue = cloneDeep(selectedValue);
      this.isGroupModalEditing = true;
    } else {
      this.groupModalPath = `${this.path}[${this.values?.length ?? 0}]`;
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
    if (this.selectedValue) {
      assign(this.selectedValue, this.groupModalValue);
    } else {
      this.addValue(this.groupModalValue);
    }
    modal.close();
  }
}
