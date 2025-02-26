import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NavigationService } from 'shared';

@Component({
  templateUrl: './edit-export.component.html',
  standalone: false,
})
export class EditExportComponent implements OnInit {
  id: string = '';
  isEditing = false;

  params?: HttpParams;

  constructor(
    private navigation: NavigationService,
    public route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.params = new HttpParams({ fromObject: { exportId: this.id } });
  }

  onDelete() {
    this.navigation.backTo(`/exports`);
  }
}
