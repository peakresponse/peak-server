import { Component, OnDestroy, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { ListComponent } from '../../shared/components';
import { NavigationService } from '../../shared/services';
import { AgencyService } from '../agencies/agency.service';

@Component({
  templateUrl: './list-users.component.html',
  styleUrls: ['./list-users.component.scss'],
})
export class ListUsersComponent implements OnDestroy {
  @ViewChild('currentList') currentList: ListComponent;

  currentParams = new HttpParams().set('isPending', '0');
  pendingParams = new HttpParams().set('isPending', '1');

  private routerSubscription: Subscription;

  constructor(public agency: AgencyService, private navigation: NavigationService) {
    this.routerSubscription = this.navigation
      .getRouter()
      .events.pipe(filter((event: any) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.url == '/users' && this.navigation.getPreviousUrl() == '/users/(modal:invite)') {
          this.currentList.refresh();
        }
      });
  }

  ngOnDestroy() {
    this.routerSubscription.unsubscribe();
  }
}
