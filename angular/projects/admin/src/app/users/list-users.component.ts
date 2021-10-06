import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './list-users.component.html',
})
export class ListUsersComponent {
  constructor(public route: ActivatedRoute) {}
}
