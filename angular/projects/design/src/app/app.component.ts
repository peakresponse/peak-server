import { Component } from '@angular/core';

@Component({
  selector: 'design-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  user: any = {
    firstName: 'John',
    lastName: 'Doe',
    position: 'Captain',
    iconUrl: null,
    currentAssignment: {
      vehicleId: 'abcd',
      vehicle: {
        number: '55',
      },
    },
  };
}
