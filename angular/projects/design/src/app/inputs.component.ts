import { Component } from '@angular/core';

@Component({
  templateUrl: './inputs.component.html',
})
export class InputsComponent {
  source: any = {
    empty: '',
    disabled: 'Input',
    readonly: 'Input',
    invalid: 'Input',
    dropdown: '',
    disabledDropdown: 'entry-2',
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
