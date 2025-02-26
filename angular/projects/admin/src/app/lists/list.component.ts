import { HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './list.component.html',
  standalone: false,
})
export class ListComponent {
  params = new HttpParams();

  constructor(public route: ActivatedRoute) {}

  ngOnInit() {
    this.params = this.params.set('listId', this.route.snapshot.params['id']);
  }
}
