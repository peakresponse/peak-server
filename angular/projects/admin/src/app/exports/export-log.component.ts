import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NavigationService } from 'shared';

@Component({
  templateUrl: './export-log.component.html',
  standalone: false,
})
export class ExportLogComponent implements OnInit {
  id: string = '';
  exportTriggerId: string = '';
  exportId: string = '';

  constructor(public route: ActivatedRoute) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.exportTriggerId = this.route.snapshot.parent?.params['id'];
    this.exportId = this.route.snapshot.parent?.parent?.params['id'];
  }
}
