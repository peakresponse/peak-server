import { Component } from '@angular/core';
import { UserService } from 'shared';

@Component({
  templateUrl: './list-incidents.component.html',
})
export class ListIncidentsComponent {
  constructor(public user: UserService) {}
}
