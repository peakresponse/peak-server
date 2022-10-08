import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { v4 as uuid } from 'uuid';

import { FormComponent, NavigationService, NotificationService } from 'shared';

@Component({
  templateUrl: './edit-form-demographics.component.html',
})
export class EditFormDemographicsComponent {
  id: string = '';
  @ViewChild('form') form?: FormComponent;

  constructor(private navigation: NavigationService, private notification: NotificationService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
  }

  onSubmit(record: any) {
    if (record.currentId) {
      record.canonicalId = record.id;
      record.parentId = record.currentId;
      record.id = uuid();
      delete record.currentId;
    }
    return record;
  }

  onUpdate() {
    this.notification.push('Form updated!');
    this.navigation.backTo(`/demographics/forms`);
  }

  onDelete() {
    this.navigation.backTo(`/demographics/forms`);
  }
}
