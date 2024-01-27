import { Component, ContentChild, ElementRef, Input, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { ActivatedRoute, NavigationEnd } from '@angular/router';

import { assign, clone, get, remove } from 'lodash-es';
import { Subscription, EMPTY } from 'rxjs';
import { catchError, filter } from 'rxjs/operators';

import { ApiService } from '../services/api.service';
import { NavigationService } from '../services/navigation.service';
import { UserService } from '../services/user.service';

import { AutoloadDirective } from '../directives/autoload.directive';

@Component({
  selector: 'shared-list',
  templateUrl: './list.component.html',
})
export class ListComponent {
  @Input() transform: any = null;
  @Input() type: string = '';
  @Input() basePath: string = '';
  @Input() params?: HttpParams;
  @Input() search: string = '';
  @ContentChild(TemplateRef) template: TemplateRef<any> | null = null;
  @ContentChild('empty') emptyTemplate: TemplateRef<any> | null = null;

  records: any[] | null = null;
  paginationLink: string | null = null;
  @ViewChild('paginationLoader') paginationLoader?: AutoloadDirective;
  isLoading = true;

  apiSubscription?: Subscription;
  routerSubscription?: Subscription;

  constructor(
    protected api: ApiService,
    protected currentUser: UserService,
    protected navigation: NavigationService,
    protected route: ActivatedRoute,
  ) {}

  ngOnInit() {
    if (!this.basePath) {
      this.basePath = `/${this.type}`;
    }
    this.routerSubscription = this.navigation
      .getRouter()
      .events.pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        if ((event as NavigationEnd).url.endsWith(this.basePath)) {
          let prevUrl = this.navigation.getPreviousUrl();
          let match = prevUrl.match(`${this.basePath}(.+)`);
          if (match) {
            let id = match[1].substring(match[1].lastIndexOf('/') + 1);
            if (id === 'new' || id === 'publish') {
              this.refresh();
            } else {
              this.refreshRecord(id);
            }
          }
        }
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.refresh();
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
    this.apiSubscription?.unsubscribe();
  }

  refresh() {
    this.apiSubscription?.unsubscribe();
    this.records = [];
    this.isLoading = true;
    this.paginationLink = null;
    let params = this.params;
    if (this.search != null && this.search != '') {
      params = params || new HttpParams();
      params = params.set('search', this.search);
    }
    this.apiSubscription = get(this.api, this.type)
      .index(params)
      .subscribe((response: HttpResponse<any>) => this.handleResponse(response));
  }

  refreshRecord(id: string) {
    if (this.apiSubscription) {
      this.apiSubscription.unsubscribe();
    }
    if (!get(this.api, this.type).get) {
      return;
    }
    this.apiSubscription = get(this.api, this.type)
      .get(id)
      .pipe(
        catchError((response: HttpErrorResponse) => {
          if (response.status == 404) {
            //// deleted, remove from list
            let records = clone(this.records ?? []);
            remove(records, (r: any) => {
              return r.id == id;
            });
            this.records = records;
          }
          return EMPTY;
        }),
      )
      .subscribe((response: HttpResponse<any>) => {
        let found = false;
        for (let record of this.records ?? []) {
          if (record.id == id) {
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
    this.isLoading = false;
    let records = response.body;
    if (this.transform) {
      records = this.transform(records);
    }
    if (this.records == null) {
      this.records = records;
    } else {
      this.records = this.records.concat(records);
    }
    const link = response.headers.get('Link');
    if (link) {
      this.paginationLink = this.api.parsePaginationLink(link).next;
    }
  }

  trackById(record: any, index: number): string {
    return record.id;
  }

  onScroll($event: any) {
    if (this.paginationLoader) {
      this.paginationLoader.onScroll($event);
    }
  }

  onLoadMore(paginationLink: string) {
    this.isLoading = true;
    this.paginationLink = null;
    this.api.get(paginationLink).subscribe((response) => this.handleResponse(response));
  }
}
