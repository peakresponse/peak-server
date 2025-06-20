import { Component, Input, ViewChild } from '@angular/core';

import { TextFieldComponent } from 'shared';

@Component({
  selector: 'app-venue-facility-form',
  templateUrl: './venue-facility-form.component.html',
  standalone: false,
})
export class VenueFacilityFormComponent {
  @Input() record: any = null;
  @Input() error: any = null;

  @ViewChild('inventoryNameField') inventoryNameField?: TextFieldComponent;

  newInventory = {
    'inventory-name': '',
  };

  onAddInventory(addItem: (item: any) => void) {
    addItem(this.newInventory['inventory-name']);
    this.newInventory = { 'inventory-name': '' };
    this.inventoryNameField?.focus();
  }
}
