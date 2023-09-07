import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import { ApiService } from 'shared';

@Component({
  templateUrl: './validate-version-demographics.component.html',
})
export class ValidateVersionDemographicsComponent implements OnInit {
  id: string = '';
  validationErrors: any;

  constructor(private api: ApiService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.api.versions.validate(this.id).subscribe((response: HttpResponse<any>) => (this.validationErrors = response.body));
  }
}
