import { HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './list-psap-dispatchers.component.html',
})
export class ListPsapDispatchersComponent {
  id: string = '';
  params: HttpParams = new HttpParams();

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.params = this.params.set('psapId', this.id);
  }
}
