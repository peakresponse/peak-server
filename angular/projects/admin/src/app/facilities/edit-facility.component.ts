import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { FormComponent, ApiService, NavigationService } from 'shared';

@Component({
  templateUrl: './edit-facility.component.html',
})
export class EditFacilityComponent {
  id: string = '';
  @ViewChild('form') form?: FormComponent;

  constructor(private api: ApiService, private navigation: NavigationService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
  }

  onDelete() {
    this.navigation.backTo(`/facilities`);
  }

  onGeocode() {
    this.api.facilities.geocode(this.id).subscribe(() => {
      this.form?.refresh();
    });
  }
}
