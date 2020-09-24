import { Component } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './list-states.component.html',
  styleUrls: ['./list-states.component.scss'],
})
export class ListStatesComponent {
  constructor(public route: ActivatedRoute) {}
}
