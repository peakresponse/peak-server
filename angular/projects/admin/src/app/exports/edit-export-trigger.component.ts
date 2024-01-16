import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NavigationService } from 'shared';

@Component({
  templateUrl: './edit-export-trigger.component.html',
})
export class EditExportTriggerComponent implements OnInit {
  id: string = '';
  exportId: string = '';
  isEditing = false;

  constructor(
    private navigation: NavigationService,
    public route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.exportId = this.route.snapshot.parent?.params['id'];
  }

  onDelete() {
    this.navigation.backTo(`/exports/${this.exportId}`);
  }
}
