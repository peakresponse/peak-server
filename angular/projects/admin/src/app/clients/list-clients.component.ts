import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './list-clients.component.html',
})
export class ListClientsComponent {
  search = '';
  searchHandler = (search: string) => (this.search = search);

  constructor(public route: ActivatedRoute) {}
}
