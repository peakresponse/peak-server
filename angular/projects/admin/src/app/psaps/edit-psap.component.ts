import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { FormComponent, ApiService, NavigationService } from 'shared';

@Component({
  templateUrl: './edit-psap.component.html',
})
export class EditPsapComponent {
  id: string = '';

  constructor(private api: ApiService, private navigation: NavigationService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
  }
}
