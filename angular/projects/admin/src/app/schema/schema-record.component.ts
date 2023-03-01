import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, ContentChild, Input, OnDestroy, TemplateRef } from '@angular/core';
import { EMPTY, Subscription } from 'rxjs';

import { cloneDeep, get } from 'lodash';

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

  isEditingDraft = false;
  isSavedErrorFree = false;
  isDraftDeleted = false;

  clone: any;

  get isNewRecord(): boolean {
    return this.id === 'new';
  }

  get hasDraft(): boolean {
    return this.data?.draft !== undefined;
  }

  get record(): any {
    return this.isEditingDraft ? this.clone.draft : this.clone;
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.subscription = this.route.paramMap.subscribe((params) => {
      this.id = params.get('id');
      if (this.id === 'new') {
        this.id = 'new';
        this.data = this.defaultValues;
        this.clone = cloneDeep(this.data);
        this.isLoading = !this.schemaData && !this.data;
      } else {
        let request: any = get(this.api, this.keyPath);
        if (this.id) {
          request = request.get(this.id);
        } else {
          request = request.index();
        }
        request.subscribe((response: HttpResponse<any>) => {
          this.data = response.body || {};
          this.clone = cloneDeep(this.data);
          this.isLoading = !this.schemaData && !this.data;
          this.isEditingDraft = this.data.draft !== undefined;
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onSubmit() {
    let request;
    if (this.isNewRecord) {
      request = get(this.api, this.keyPath).create(this.record);
    } else {
      request = get(this.api, this.keyPath).update(this.record.id, this.record);
    }
    this.isLoading = true;
    this.isSavedErrorFree = false;
    this.isDraftDeleted = false;
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
      .subscribe((response: HttpResponse<any>) => {
        this.isLoading = false;
        if (response.status !== 204) {
          const data = response.body;
          if (this.isNewRecord) {
            this.data = data;
          } else {
            this.data.draft = data;
            this.isEditingDraft = true;
          }
          this.clone = cloneDeep(this.data);
          if (data.isValid) {
            if (this.isNewRecord) {
              let url = this.navigation.getCurrentUrl();
              url = url.substring(0, url.lastIndexOf('/'));
              this.navigation.backTo(url);
              this.notification.push('Added!');
            } else {
              this.isSavedErrorFree = true;
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          } else {
            this.error = {
              status: 422,
              messages: data.validationErrors.errors,
            };
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      });
  }

  onDeleteDraft() {
    this.isLoading = true;
    this.isSavedErrorFree = false;
    this.isDraftDeleted = false;
    this.error = null;
    get(this.api, this.keyPath)
      .delete(this.data.draft.id)
      .pipe(
        catchError((response: HttpErrorResponse) => {
          this.isLoading = false;
          this.error = response.error;
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return EMPTY;
        })
      )
      .subscribe((response: HttpResponse<any>) => {
        this.isLoading = false;
        delete this.data.draft;
        this.isEditingDraft = false;
        this.isDraftDeleted = true;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
  }
}
