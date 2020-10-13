import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, PRIMARY_OUTLET, Router } from '@angular/router';

import isEmpty from 'lodash/isEmpty';
import { Observable } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';

@Injectable()
export class NavigationService {
  private currentUrl: string;
  private previousUrl: string;

  constructor(private location: Location, private router: Router, private route: ActivatedRoute, private title: Title) {
    //// keep track of the current and previous url
    router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.previousUrl = this.currentUrl;
      this.currentUrl = event.url;
      // console.log('prev', this.previousUrl, 'current', this.currentUrl);
    });
    //// update Title from route data
    router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => this.route),
        map((route) => {
          while (route.firstChild) route = route.firstChild;
          return route;
        }),
        filter((route) => route.outlet === 'primary'),
        mergeMap((route) => route.data)
      )
      .subscribe((data) => {
        if (data['title']) {
          this.setTitle(data['title']);
        }
      });
  }

  getRouter() {
    return this.router;
  }

  setTitle(title: string) {
    this.title.setTitle(`${title} - Peak Response`);
  }

  getPath(url: string): string {
    let index: number;
    index = url?.indexOf('?');
    if (index >= 0) {
      return url.substring(0, index);
    }
    index = url?.indexOf('#');
    if (index >= 0) {
      return url.substring(0, index);
    }
    return url;
  }

  getCurrentPath(): string {
    return this.getPath(this.currentUrl);
  }

  getCurrentUrl(): string {
    return this.currentUrl;
  }

  getPreviousPath(): string {
    return this.getPath(this.previousUrl);
  }

  getPreviousUrl(): string {
    return this.previousUrl;
  }

  goTo(url: string, queryParams: any = null, fragment: string = null, replaceUrl: boolean = false) {
    this.router.navigate([url], { queryParams, fragment, replaceUrl });
  }

  replaceWith(url: any, queryParams: any = null, fragment: string = null) {
    this.goTo(url, queryParams, fragment, true);
  }

  backTo(url: string) {
    if (this.previousUrl == url) {
      this.location.back();
    } else {
      const urlComponents = this.router.parseUrl(url);
      this.router.navigate([`/${urlComponents.root.children[PRIMARY_OUTLET].toString()}`], {
        queryParams: urlComponents.queryParams,
        fragment: urlComponents.fragment,
      });
    }
  }
}
