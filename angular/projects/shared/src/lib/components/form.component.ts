import { Component, ContentChild, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { ApiService } from '../services/api.service';
import { UserService } from '../services/user.service';

import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'shared-form',
  templateUrl: './form.component.html',
})
export class FormComponent {
  @Input() id: string | null = null;
  @Input() type: string = '';
  @Input() record: any = {};
  @Input() transformRecord: (record: any) => any = (record) => record;
  @Input() hideButtons = false;
  @Input() createLabel: string = 'Create';
  @Input() updateLabel: string = 'Update';
  @Input() disabled = false;
  @Output() create = new EventEmitter<any>();
  @Output() update = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @ContentChild(TemplateRef) template: TemplateRef<any> | null = null;

  loading = false;
  updated = false;
  error = false;

  constructor(protected api: ApiService, protected currentUser: UserService) {}

  ngOnInit() {
    if (this.id) {
      this.refresh();
    }
  }

  refresh(callback?: any) {
    this.loading = true;
    (this.api as any)[this.type]
      .get(this.id)
      .pipe(
        catchError((response: HttpErrorResponse) => {
          this.error = response.error;
          this.loading = false;
          return EMPTY;
        })
      )
      .subscribe((response: HttpResponse<any>) => {
        this.loading = false;
        this.record = response.body;
        if (callback) {
          callback();
        }
      });
  }

  get canSave(): boolean {
    if (this.id) {
      return (this.api as any)[this.type].update !== undefined;
    }
    return (this.api as any)[this.type].create !== undefined;
  }

  onSubmit() {
    this.loading = true;
    this.updated = false;
    this.error = false;
    if (this.id) {
      (this.api as any)[this.type]
        .update(this.id, this.transformRecord(this.record))
        .pipe(
          catchError((response: HttpErrorResponse) => {
            this.error = response.error;
            this.loading = false;
            return EMPTY;
          })
        )
        .subscribe((response: HttpResponse<any>) => {
          this.loading = false;
          this.updated = true;
          this.record = response.body;
          this.update.emit(response.body);
        });
    } else {
      (this.api as any)[this.type]
        .create(this.transformRecord(this.record))
        .pipe(
          catchError((response: HttpErrorResponse) => {
            this.error = response.error;
            this.loading = false;
            return EMPTY;
          })
        )
        .subscribe((response: HttpResponse<any>) => {
          this.loading = false;
          this.create.emit(response.body);
        });
    }
    return false;
  }

  get canDelete(): boolean {
    return (this.api as any)[this.type].delete !== undefined;
  }

  onDelete() {
    this.loading = true;
    this.error = false;
    (this.api as any)[this.type]
      .delete(this.id)
      .pipe(
        catchError((response: HttpErrorResponse) => {
          this.error = response.error;
          this.loading = false;
          return EMPTY;
        })
      )
      .subscribe((response: HttpResponse<any>) => {
        this.loading = false;
        this.delete.emit(response.body);
      });
  }
}
