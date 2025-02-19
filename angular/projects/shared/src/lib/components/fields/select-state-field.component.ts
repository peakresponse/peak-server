import { Component } from '@angular/core';
import { HttpResponse } from '@angular/common/http';

import { ApiService } from '../../services/api.service';
import { BaseFieldComponent } from './base-field.component';

@Component({
  selector: 'shared-select-state-field',
  templateUrl: './select-state-field.component.html',
  standalone: false,
})
export class SelectStateFieldComponent extends BaseFieldComponent {
  states: any[] = [];

  constructor(private api: ApiService) {
    super();
  }

  ngOnInit() {
    this.api.states.index().subscribe((res: HttpResponse<any>) => (this.states = res.body));
  }
}
