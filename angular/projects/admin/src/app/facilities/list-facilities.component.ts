import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './list-facilities.component.html',
  standalone: false,
})
export class ListFacilitiesComponent {
  search: string = '';

  constructor(public route: ActivatedRoute) {}
}
