import { Component } from '@angular/core';

@Component({
  templateUrl: './headers.component.html',
  standalone: false,
})
export class HeadersComponent {
  user: any = {
    firstName: 'John',
    lastName: 'Doe',
    position: 'Captain',
    iconUrl: null,
  };
}
