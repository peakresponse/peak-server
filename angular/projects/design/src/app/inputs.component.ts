import { Component } from '@angular/core';

@Component({
  templateUrl: './inputs.component.html',
  styleUrls: ['./inputs.component.scss'],
})
export class InputsComponent {
  source: any = {
    empty: '',
    disabled: 'Input',
    readonly: 'Input',
    invalid: 'Input',
  };
  error: any = {
    messages: [
      {
        path: 'invalid',
        message: 'Error note',
      },
    ],
  };
}
