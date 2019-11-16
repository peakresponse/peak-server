import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';


@Component({
  templateUrl: './show.component.html'
})
export class ShowPatientComponent {
  id: string = null;

  constructor(public route: ActivatedRoute) {
  }

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
  }
}
