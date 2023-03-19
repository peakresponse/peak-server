import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { v4 as uuid } from 'uuid';

import { FormComponent, NavigationService, NotificationService } from 'shared';

@Component({
  templateUrl: './edit-version-demographics.component.html',
})
export class EditVersionDemographicsComponent {
  id: string = '';
  @ViewChild('form') form?: FormComponent;

  constructor(private navigation: NavigationService, private notification: NotificationService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
  }

  onSubmit(record: any) {}

  onUpdate() {}
}
