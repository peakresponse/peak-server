import { Component, Input, OnInit } from '@angular/core';
import { HttpParams, HttpResponse } from '@angular/common/http';

import { ApiService } from 'shared';

@Component({
  selector: 'admin-interfaces-element-form',
  templateUrl: './interface-element-form.component.html',
  standalone: false,
})
export class InterfaceElementFormComponent implements OnInit {
  @Input() interfaceId?: string;
  @Input() record: any = null;
  @Input() error: any = null;

  nemsisElementSearchParams = new HttpParams();
  nemsisElementFormatter = (result: any) => `${result.displayName} (${result.name})`;

  screenSearchParams = new HttpParams();

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.screenSearchParams = this.screenSearchParams.set('interfaceId', this.interfaceId ?? '');
    this.api.interfaces.get(this.interfaceId ?? '').subscribe((res: HttpResponse<any>) => {
      const { nemsisVersion } = res.body;
      this.nemsisElementSearchParams = this.nemsisElementSearchParams.set('nemsisVersion', nemsisVersion);
    });
  }
}
