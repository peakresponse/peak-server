import { Component, ContentChild, EventEmitter, Input, OnChanges, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { get } from 'lodash-es';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiService } from '../services/api.service';
import { UserService } from '../services/user.service';
import { ModalComponent } from './modal.component';

@Component({
  selector: 'shared-form',
  templateUrl: './form.component.html',
})
export class FormComponent implements OnChanges {
  @Input() id: string | null = null;
  @Input() type: string = '';
  @Input() record: any = {};
  @Input() transformRecord: (record: any) => any = (record) => record;
  @Input() hideButtons = false;
  @Input() createLabel: string = 'Create';
  @Input() updateLabel: string = 'Update';
  @Input() deleteLabel: string = 'Delete';
  @Input() disabled = false;
  @Output() load = new EventEmitter<any>();
  @Output() create = new EventEmitter<any>();
  @Output() update = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @ContentChild(TemplateRef) template: TemplateRef<any> | null = null;
  @ViewChild('deleteConfirmation') deleteModal?: ModalComponent;

  loading = false;
  updated = false;
  error = false;

  constructor(
    protected api: ApiService,
    protected currentUser: UserService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id']) {
      this.refresh();
    }
  }

  refresh() {
    this.loading = true;
    get(this.api, this.type)
      .get(this.id)
      .pipe(
        catchError((response: HttpErrorResponse) => {
          this.error = response.error;
          this.loading = false;
          return EMPTY;
        }),
      )
      .subscribe((response: HttpResponse<any>) => {
        this.loading = false;
        this.record = response.body;
        this.load.emit(this.record);
      });
  }

  get canSave(): boolean {
    if (this.id) {
      return get(this.api, this.type).update !== undefined;
    }
    return get(this.api, this.type).create !== undefined;
  }

  onSubmit() {
    this.loading = true;
    this.updated = false;
    this.error = false;
    if (this.id) {
      get(this.api, this.type)
        .update(this.id, this.transformRecord(this.record))
        .pipe(
          catchError((response: HttpErrorResponse) => {
            this.error = response.error;
            this.loading = false;
            return EMPTY;
          }),
        )
        .subscribe((response: HttpResponse<any>) => {
          this.loading = false;
          this.updated = true;
          this.record = response.body;
          this.update.emit(response.body);
        });
    } else {
      get(this.api, this.type)
        .create(this.transformRecord(this.record))
        .pipe(
          catchError((response: HttpErrorResponse) => {
            this.error = response.error;
            this.loading = false;
            return EMPTY;
          }),
        )
        .subscribe((response: HttpResponse<any>) => {
          this.loading = false;
          this.create.emit(response.body);
        });
    }
    return false;
  }

  get canDelete(): boolean {
    return get(this.api, this.type).delete !== undefined;
  }

  onDelete() {
    this.deleteModal?.close();
    this.loading = true;
    this.error = false;
    get(this.api, this.type)
      .delete(this.id)
      .pipe(
        catchError((response: HttpErrorResponse) => {
          this.error = response.error;
          this.loading = false;
          return EMPTY;
        }),
      )
      .subscribe((response: HttpResponse<any>) => {
        this.loading = false;
        this.delete.emit(response.body);
      });
  }
}
