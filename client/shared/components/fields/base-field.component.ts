import { ContentChild, Input, TemplateRef } from '@angular/core';

export class BaseFieldComponent {
  @ContentChild(TemplateRef) template: TemplateRef<any>;
  @Input() id: string;
  @Input() name: string;
  @Input() label: string;
  @Input() placeholder: string;
  @Input() target: any;
  @Input() source: any;
  @Input() propertyName: string;
  @Input() isFocusable: boolean = true;

  isFocused = false;

  get isEditing(): boolean {
    return this.target != null;
  }

  get derivedId(): string {
    return this.id || this.name || this.propertyName;
  }

  get derivedName(): string {
    return this.name || this.propertyName || this.id;
  }

  get derivedPropertyName(): string {
    return this.propertyName || this.name || this.id;
  }

  get value(): string {
    return this.isEditing ? this.target[this.derivedPropertyName] : this.source?.[this.derivedPropertyName];
  }

  set value(value: string) {
    this.target[this.derivedPropertyName] = value;
  }

  onClear() {
    this.value = null;
  }

  onClick(event: MouseEvent) {
    const target = <Element>event.target;
    if (target.classList.contains('form-field')) {
      const rect = target.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      let style = getComputedStyle(target, ':after');
      let targetRect = {
        x1: parseInt(style.left),
        y1: parseInt(style.top),
        x2: parseInt(style.left) + parseInt(style.width),
        y2: parseInt(style.top) + parseInt(style.height),
      };
      if (x >= targetRect.x1 && x < targetRect.x2 && y >= targetRect.y1 && y < targetRect.y2) {
        this.onClear();
      }
    }
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
