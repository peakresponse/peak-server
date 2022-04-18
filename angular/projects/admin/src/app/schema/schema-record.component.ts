import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, ContentChild, Input, OnDestroy, TemplateRef } from '@angular/core';
import { EMPTY, Subscription } from 'rxjs';

import { get } from 'lodash';

import { BaseSchemaComponent } from './base-schema.component';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'admin-schema-record',
  templateUrl: './schema-record.component.html',
})
export class SchemaRecordComponent extends BaseSchemaComponent implements OnDestroy {
  @Input() id?: string | null;
  @Input() defaultValues: any;
  @ContentChild(TemplateRef) template: TemplateRef<any> | null = null;
  subscription?: Subscription;

  get isNewRecord(): boolean {
    return this.id === 'new';
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.subscription = this.route.paramMap.subscribe((params) => {
      this.id = params.get('id');
      if (this.id && this.id !== 'new') {
        get(this.api, this.keyPath)
          .get(this.id)
          .subscribe((response: HttpResponse<any>) => {
            this.data = response.body || {};
            this.isLoading = !this.schemaData && !this.data;
          });
      } else {
        this.id = 'new';
        this.data = this.defaultValues;
        this.isLoading = !this.schemaData && !this.data;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onSubmit() {
    let request;
    if (this.isNewRecord) {
      request = get(this.api, this.keyPath).create(this.data);
    } else {
      request = get(this.api, this.keyPath).update(this.id, this.data);
    }
    this.isLoading = true;
    this.error = null;
    request
      .pipe(
        catchError((response: HttpErrorResponse) => {
          this.isLoading = false;
          this.error = response.error;
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.isLoading = false;
        let url = this.navigation.getCurrentUrl();
        url = url.substring(0, url.lastIndexOf('/'));
        this.navigation.backTo(url);
        this.notification.push(this.isNewRecord ? 'Added!' : 'Saved!');
      });
  }
}
