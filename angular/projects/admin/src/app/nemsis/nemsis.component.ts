import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { ApiService, ListComponent } from 'shared';

@Component({
  templateUrl: './nemsis.component.html',
  standalone: false,
})
export class NemsisComponent implements OnInit {
  nemsisVersion?: string;
  params = new HttpParams({ fromObject: {} });
  isImporting = false;
  @ViewChild('list') list?: ListComponent;

  constructor(
    private api: ApiService,
    public route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.nemsisVersion = this.route.snapshot.params['nemsisVersion'];
    this.params = this.params.set('nemsisVersion', this.nemsisVersion ?? '');
  }

  onClickImport() {
    this.isImporting = true;
    this.api.nemsisElements.import(this.nemsisVersion ?? '').subscribe((res: HttpResponse<any>) => {
      this.isImporting = false;
      this.list?.refresh();
    });
  }
}
