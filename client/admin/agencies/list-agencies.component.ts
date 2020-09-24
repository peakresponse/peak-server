import { Component } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './list-agencies.component.html',
  styleUrls: ['./list-agencies.component.scss'],
})
export class ListAgenciesComponent {
  constructor(public route: ActivatedRoute) {}
}
