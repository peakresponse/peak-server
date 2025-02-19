import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import { ApiService } from 'shared';

@Component({
  templateUrl: './preview-version-demographics.component.html',
  standalone: false,
})
export class PreviewVersionDemographicsComponent implements OnInit {
  id: string = '';
  xml?: string;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.api.versions.preview(this.id).subscribe((response: HttpResponse<any>) => (this.xml = response.body));
  }
}
