import { Component, ViewChild } from '@angular/core';

import { of } from 'rxjs';

const states = [
  'Alabama',
  'Alaska',
  'American Samoa',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'District Of Columbia',
  'Federated States Of Micronesia',
  'Florida',
  'Georgia',
  'Guam',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Marshall Islands',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Northern Mariana Islands',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Palau',
  'Pennsylvania',
  'Puerto Rico',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virgin Islands',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
];

@Component({
  templateUrl: './inputs.component.html',
  standalone: false,
})
export class InputsComponent {
  source: any = {
    array: ['California', 'New York'],
    'array-noclear': ['California', 'New York'],
    empty: '',
    multiline: 'This is a\nmultiline\ntext field.',
    disabled: 'Input',
    readonly: 'Input',
    invalid: 'Input',
    plaintext: 'Plain text without borders',
    checkbox: '',
    readonlyCheckbox: true,
    file: '',
    dropdown: '',
    disabledDropdown: 'entry-2',
    readonlyDropdown: 'entry-2',
    search: '',
  };
  error: any = {
    messages: [
      {
        path: 'invalid',
        message: 'Error note',
      },
    ],
  };
  search = (term: string) =>
    term.length < 2 ? of([]) : of(states.filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10));
}
