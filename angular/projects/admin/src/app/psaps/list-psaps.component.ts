import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './list-psaps.component.html',
  standalone: false,
})
export class ListPsapsComponent {
  search: string = '';

  constructor(public route: ActivatedRoute) {}
}
