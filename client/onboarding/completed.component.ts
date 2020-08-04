import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

import { AppService } from './app.service';
import { ApiService } from '../shared/services';

@Component({
  templateUrl: './completed.component.html'
})
export class CompletedComponent {
  agencyId: string = null;
  subdomain: string = null;

  constructor(private app: AppService, private api: ApiService, private route: ActivatedRoute, private sanitizer: DomSanitizer ) {
    this.agencyId = this.route.snapshot.queryParamMap.get('agencyId');
    if (!this.app.agency) {
      this.api.agencies.demographic(this.agencyId).subscribe(res => this.subdomain = res.body.subdomain);
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
