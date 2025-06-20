import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { FormComponent, ModalComponent, NavigationService, TextFieldComponent } from 'shared';

@Component({
  templateUrl: './edit-venue.component.html',
  standalone: false,
})
export class EditVenueComponent implements OnInit {
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
    this.navigation.backTo(`/venues`);
  }

  onUpdate(record: any) {
    this.form?.refresh();
    this.isEditing = false;
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
