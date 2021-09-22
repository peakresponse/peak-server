import { Component, ContentChild, ElementRef, Input, TemplateRef, ViewChild } from '@angular/core';

@Component({
  template: '',
})
export class BaseFieldComponent {
  @ViewChild('inputEl') inputEl?: ElementRef;
  @ContentChild(TemplateRef) template: TemplateRef<any> | null = null;
  @Input() id?: string;
  @Input() name?: string;
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() target?: any;
  @Input() source?: any;
  @Input() propertyName?: string;
  @Input() error: any;
  @Input() hasError: boolean = false;
  @Input() isDisabled: boolean = false;
  @Input() isFocusable: boolean = true;

  isFocused = false;

  get isEditing(): boolean {
    return this.target != null;
  }

  get isInvalid(): boolean {
    return this.hasError || this.error?.messages?.find((error: any) => error.path === this.derivedPropertyName) !== undefined;
  }

  get errorMessage(): string | undefined {
    return this.error?.messages?.find((error: any) => error.path === this.derivedPropertyName).message;
  }

  get isNonEmpty(): boolean {
    const value = this.value;
    return value && value !== '' ? true : false;
  }

  get isUnconfirmed(): boolean {
    const predictions = this.isEditing ? this.target?.predictions : this.source?.predictions;
    if (predictions && predictions[this.derivedPropertyName]) {
      if (predictions[this.derivedPropertyName].status == 'UNCONFIRMED') {
        return true;
      }
    }
    return false;
  }

  get derivedId(): string {
    return this.id || this.name || this.propertyName || '';
  }

  get derivedName(): string {
    return this.name || this.propertyName || this.id || '';
  }

  get derivedPropertyName(): string {
    return this.propertyName || this.name || this.id || '';
  }

  get value(): any {
    return this.isEditing ? this.target[this.derivedPropertyName] : this.source?.[this.derivedPropertyName];
  }

  set value(value: any) {
    this.target[this.derivedPropertyName] = value;
    this.setPredictionStatus('CORRECTED');
  }

  focus() {
    this.inputEl?.nativeElement.focus();
  }

  onClear() {
    this.value = null;
  }

  onConfirm() {
    if (this.isUnconfirmed) {
      this.setPredictionStatus('CONFIRMED');
    }
  }

  setPredictionStatus(status: string) {
    if (this.isEditing) {
      const predictions = this.target?.predictions;
      if (predictions && predictions[this.derivedPropertyName]) {
        predictions[this.derivedPropertyName].status = status;
      }
    }
  }

  onClick(event: MouseEvent) {
    const target = <Element>event.target;
    if (target.classList.contains('form-field')) {
      const rect = target.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      let targetRect = this.getTargetRect(target, ':after');
      if (x >= targetRect.x1 && x < targetRect.x2 && y >= targetRect.y1 && y < targetRect.y2) {
        this.onClear();
      }
      targetRect = this.getTargetRect(target, ':before');
      if (x >= targetRect.x1 && x < targetRect.x2 && y >= targetRect.y1 && y < targetRect.y2) {
        this.onConfirm();
      }
    }
  }

  getTargetRect(target: Element, selector: string) {
    const style = getComputedStyle(target, selector);
    const targetRect = {
      x1: parseInt(style.left),
      y1: parseInt(style.top),
      x2: parseInt(style.left) + parseInt(style.width),
      y2: parseInt(style.top) + parseInt(style.height),
    };
    return targetRect;
  }

  onFocus(event: any) {
    if (this.isEditing) {
      this.isFocused = true;
    }
  }

  onBlur(event: any) {
    this.isFocused = false;
  }
}
