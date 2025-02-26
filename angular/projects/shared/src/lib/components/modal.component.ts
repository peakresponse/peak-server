import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { first } from 'rxjs/operators';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { extend } from 'lodash-es';

@Component({
  selector: 'shared-modal',
  templateUrl: './modal.component.html',
  standalone: false,
})
export class ModalComponent {
  @Input() confirmLabel?: string;
  @Input() dangerLabel?: string;
  @Input() dismissLabel?: string;
  @Input() disabled?: boolean;
  @Output() dismiss = new EventEmitter<any>();
  @Output() confirm = new EventEmitter<any>();
  @Output() danger = new EventEmitter<any>();
  @ViewChild('content') content?: TemplateRef<any>;
  modalRef?: NgbModalRef;
  data: any = null;

  constructor(private modal: NgbModal) {}

  show(data?: any, options?: any) {
    this.data = data;
    this.open(options);
    return false;
  }

  open(options?: any) {
    this.modalRef = this.modal.open(this.content, extend({ ariaLabelledBy: 'modal-basic-title' }, options));
    this.modalRef.shown.pipe(first()).subscribe(() => {
      document.querySelector('.modal')?.scrollTo(0, 0);
      (document.querySelector('.modal input, .modal select') as HTMLElement)?.focus();
    });
  }

  close() {
    this.modalRef?.dismiss();
  }

  onConfirm() {
    this.confirm.emit(this.data);
  }

  onDismiss() {
    this.close();
    this.dismiss.emit(this.data);
  }

  onDanger() {
    this.danger.emit(this.data);
  }
}
