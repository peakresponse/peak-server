import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './list-agencies.component.html',
})
export class ListAgenciesComponent {
  search = '';
  searchHandler = (search: string) => (this.search = search);

  constructor(public route: ActivatedRoute) {}
}
