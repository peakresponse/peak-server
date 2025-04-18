import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpParams } from '@angular/common/http';

@Component({
  templateUrl: './list-interfaces.component.html',
  standalone: false,
})
export class ListInterfacesComponent {
  params = new HttpParams();

  constructor(public route: ActivatedRoute) {}
}
