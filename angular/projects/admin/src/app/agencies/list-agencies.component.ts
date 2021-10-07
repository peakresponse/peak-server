import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './list-agencies.component.html',
})
export class ListAgenciesComponent {
  search = '';

  constructor(public route: ActivatedRoute) {}
}
