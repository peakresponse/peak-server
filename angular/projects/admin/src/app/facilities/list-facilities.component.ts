import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './list-facilities.component.html',
})
export class ListFacilitiesComponent {
  search: string = '';

  constructor(public route: ActivatedRoute) {}
}
