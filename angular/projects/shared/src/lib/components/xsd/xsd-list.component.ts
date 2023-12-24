import { HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { Component, ContentChild, Input, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { NavigationEnd } from '@angular/router';

import { assign, clone, get, remove } from 'lodash-es';
import { EMPTY, Subscription } from 'rxjs';
import { catchError, filter } from 'rxjs/operators';

import { AutoloadDirective } from '../../directives/autoload.directive';

import { XsdBaseComponent } from './xsd-base.component';

@Component({
  selector: 'shared-xsd-list',
  templateUrl: './xsd-list.component.html',
})
export class XsdListComponent extends XsdBaseComponent implements OnDestroy {
  @Input() schemaColumns: any[] = [];
  @Input() addlColumns: any[] = [];
  @ContentChild(TemplateRef) template: TemplateRef<any> | null = null;

  routerSubscription?: Subscription;

  paginationLink: string | null = null;
  @ViewChild('paginationLoader') paginationLoader?: AutoloadDirective;

  query = '';

  ngOnInit(): void {
    super.ngOnInit();
    this.routerSubscription = this.navigation
      .getRouter()
      .events.pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        if ((event as NavigationEnd).url.endsWith(this.keyPath.join('/'))) {
          let prevUrl = this.navigation.getPreviousUrl();
          let match = prevUrl.match(`${this.keyPath.join('/')}\/([^\/]+)`);
          if (match) {
            let id = match[1];
            if (id == 'new') {
              this.refresh();
            } else if (id.match(/\d+/)) {
              this.refreshRecord(id);
            }
          }
        }
      });
    this.refresh();
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  refresh(): void {
    let params = new HttpParams();
    if (this.query !== '') {
      params = params.set('search', this.query);
    }
    this.data = undefined;
    this.isLoading = true;
    get(this.api, this.keyPath)
      .index(params)
      .subscribe((response: HttpResponse<any>) => this.handleResponse(response));
  }

  refreshRecord(id: string): void {
    get(this.api, this.keyPath)
      .get(id)
      .pipe(
        catchError((response: HttpErrorResponse) => {
          if (response.status == 404) {
            //// deleted, remove from list
            let records = clone(this.data ?? []);
            remove(records, (r: any) => {
              return r.id == id;
            });
            this.data = records;
          }
          return EMPTY;
        }),
      )
      .subscribe((response: HttpResponse<any>) => {
        let found = false;
        for (let record of this.data ?? []) {
          if (record.id == id) {
            delete record.draft;
            assign(record, response.body);
            found = true;
            break;
          }
        }
        if (!found) {
          this.refresh();
        }
      });
  }

  private handleResponse(response: HttpResponse<any>) {
    if (!this.data) {
      this.data = response.body || [];
    } else {
      this.data = this.data.concat(response.body || []);
    }
    this.isLoading = !this.schemaData;
    const link = response.headers.get('Link');
    if (link) {
      this.paginationLink = this.api.parsePaginationLink(link).next;
    }
  }

  onSearch(query: string): void {
    this.query = query;
    this.refresh();
  }

  onLoadMore(paginationLink: string) {
    this.isLoading = true;
    this.paginationLink = null;
    this.api.get(paginationLink).subscribe((response) => this.handleResponse(response));
  }
}
