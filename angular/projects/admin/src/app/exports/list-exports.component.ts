import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './list-exports.component.html',
})
export class ListExportsComponent {
  constructor(public route: ActivatedRoute) {}
}
