import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import { ListComponent } from '../../shared/components';

@Component({
  templateUrl: './list.component.html'
})
export class ListPatientsComponent {
  @ViewChild('list') list: ListComponent;
  intervalID: any;

  constructor(public route: ActivatedRoute) {
  }

  ngAfterViewInit() {
    this.intervalID = setInterval(() => {
      this.list.refresh();
    }, 5000);
  }

  ngOnDestroy() {
    if (this.intervalID) {
      clearInterval(this.intervalID);
    }
  }
}
