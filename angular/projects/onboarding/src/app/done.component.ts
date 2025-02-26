import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

import { ApiService } from 'shared';

import { AppService } from './app.service';

@Component({
  templateUrl: './done.component.html',
  standalone: false,
})
export class DoneComponent {
  agencyId?: string;
  subdomain?: string;

  constructor(
    private app: AppService,
    private api: ApiService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
  ) {
    this.agencyId = this.route.snapshot.queryParamMap.get('agencyId') ?? undefined;
    if (!this.app.agency) {
      this.api.agencies.check(this.agencyId ?? '').subscribe((res) => (this.subdomain = res.body.subdomain));
    } else {
      this.subdomain = this.app.agency.subdomain;
    }
  }

  get url() {
    return `${this.subdomain}.${window.location.host}`;
  }

  get safeUrl() {
    return this.sanitizer.bypassSecurityTrustUrl(`${window.location.protocol}//${this.url}`);
  }
}
