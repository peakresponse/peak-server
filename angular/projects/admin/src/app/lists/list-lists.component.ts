import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './list-lists.component.html',
  standalone: false,
})
export class ListListsComponent {
  constructor(public route: ActivatedRoute) {}
}
