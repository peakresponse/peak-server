import { HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './list-psap-dispatchers.component.html',
})
export class ListPsapDispatchersComponent {
  psapId: string = '';
  params: HttpParams = new HttpParams();

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.psapId = this.route.snapshot.params['psapId'];
    this.params = this.params.set('psapId', this.psapId);
  }
}
