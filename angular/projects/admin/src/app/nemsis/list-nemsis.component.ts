import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import { ApiService } from 'shared';

@Component({
  templateUrl: './list-nemsis.component.html',
})
export class ListNemsisComponent implements OnInit {
  nemsis: any;
  isRefreshing = false;
  isInstalling?: string;

  constructor(private api: ApiService, public route: ActivatedRoute) {}

  ngOnInit() {
    this.isRefreshing = true;
    this.api.nemsis.index().subscribe((response: HttpResponse<any>) => {
      this.nemsis = response.body;
      this.isRefreshing = false;
    });
  }

  onRefreshVersions() {
    this.isRefreshing = true;
    this.api.nemsis.pull().subscribe((response: HttpResponse<any>) => {
      this.nemsis = response.body;
      this.isRefreshing = false;
    });
  }

  onInstallVersion(version: string) {
    this.isInstalling = version;
    this.api.nemsis.install(version).subscribe((response: HttpResponse<any>) => {
      this.nemsis = response.body;
      this.isInstalling = undefined;
    });
  }
}
