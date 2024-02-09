import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  templateUrl: './guide.component.html',
  styleUrls: ['./guide.component.scss'],
})
export class GuideComponent implements OnInit {
  id?: string;

  constructor(public route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.id = params['slug'];
    });
  }
}
