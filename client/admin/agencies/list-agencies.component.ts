import { Component } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  templateUrl: './list-agencies.component.html',
  styleUrls: ['./list-agencies.component.scss'],
})
export class ListAgenciesComponent {
  search = '';
  searchSubject = new Subject<string>();

  constructor(public route: ActivatedRoute) {
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((search) => {
      this.search = search;
    });
  }
}
