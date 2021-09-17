import { Component } from '@angular/core';

@Component({
  templateUrl: './inputs.component.html',
  styleUrls: ['./inputs.component.scss'],
})
export class InputsComponent {
  source: any = {
    empty: '',
    field: 'Input',
  };
  error: any = {
    messages: [
      {
        path: 'field',
        message: 'Error note',
      },
    ],
  };
}
