import { Component, Input, OnInit } from '@angular/core';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import { ApiService } from 'shared';

@Component({
  selector: 'admin-interfaces-screen-form',
  templateUrl: './interface-screen-form.component.html',
  standalone: false,
})
export class InterfaceScreenFormComponent implements OnInit {
  @Input() record: any = null;
  @Input() error: any = null;

  interfaceId?: string;
  nemsisElementSearchParams = new HttpParams();
  nemsisElementFormatter = (result: any) => `${result.displayName} (${result.name})`;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.interfaceId = this.route.snapshot.parent?.params['id'];
    this.api.interfaces.get(this.interfaceId ?? '').subscribe((res: HttpResponse<any>) => {
      const { nemsisVersion } = res.body;
      this.nemsisElementSearchParams = this.nemsisElementSearchParams.set('nemsisVersion', nemsisVersion);
    });
  }
}
