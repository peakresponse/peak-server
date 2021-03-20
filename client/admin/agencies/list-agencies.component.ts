import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './list-agencies.component.html',
  styleUrls: ['./list-agencies.component.scss'],
})
export class ListAgenciesComponent {
  search = '';

  constructor(public route: ActivatedRoute) {}
}
