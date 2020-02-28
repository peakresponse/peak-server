import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import assign from 'lodash/assign';
import find from 'lodash/find';
import sortBy from 'lodash/sortBy';

import { WebSocketService } from '../../shared/services';

@Component({
  templateUrl: './list.component.html'
})
export class ListPatientsComponent implements AfterViewInit, OnDestroy {
  records: any[] = [];
  subscription: Subscription;

  constructor(public route: ActivatedRoute, private ws: WebSocketService) {
  }

  ngAfterViewInit() {
    this.subscription = this.ws.connect().subscribe(records => {
      for (let record of records) {
        const found = find(this.records, {id: record.id});
        if (!found) {
          this.records.push(record);
        } else {
          assign(found, record);
        }
      }
      this.records = sortBy(this.records, ['priority', 'updated_at']);
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  trackById(record: any, index: number): string {
    return record.id;
  }
}
