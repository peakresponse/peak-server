import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NavigationService } from 'shared';

@Component({
  templateUrl: './edit-export-trigger.component.html',
  standalone: false,
})
export class EditExportTriggerComponent implements OnInit {
  id: string = '';
  exportId: string = '';
  isEditing = false;
  params?: HttpParams;

  constructor(
    private navigation: NavigationService,
    public route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.exportId = this.route.snapshot.parent?.params['id'];
    this.params = new HttpParams({ fromObject: { exportId: this.exportId, exportTriggerId: this.id } });
  }

  onDelete() {
    this.navigation.backTo(`/exports/${this.exportId}`);
  }
}
