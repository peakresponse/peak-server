import { Component } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './list-facilities.component.html',
  styleUrls: ['./list-facilities.component.scss']
})
export class ListFacilitiesComponent {
  constructor(public route: ActivatedRoute) {
  }
}
