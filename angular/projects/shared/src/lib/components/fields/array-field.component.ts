import { Component, ContentChild, EventEmitter, Input, Output, TemplateRef } from '@angular/core';

import { assign } from 'lodash-es';

import { BaseFieldComponent } from './base-field.component';

@Component({
  selector: 'shared-array-field',
  templateUrl: './array-field.component.html',
  styles: [':host{display:block;}'],
})
export class ArrayFieldComponent extends BaseFieldComponent {
  @Input() showClearButton = true;
  @Output() sorted = new EventEmitter<any>();
  @ContentChild('item') itemTemplate: TemplateRef<any> | null = null;
  @ContentChild('form') formTemplate: TemplateRef<any> | null = null;
  @ContentChild('header') headerTemplate: TemplateRef<any> | null = null;

  onClick(event: MouseEvent) {
    const target = <HTMLElement>event.target;
    if (target.classList.contains('array-field__item')) {
      const rect = target.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      let targetRect = this.getTargetRect(target, ':after');
      if (x >= targetRect.x1 && x < targetRect.x2 && y >= targetRect.y1 && y < targetRect.y2) {
        const index = parseInt(target.dataset.index ?? '', 10);
        if (!Number.isNaN(index)) {
          const values: any[] = this.value;
          values.splice(index, 1);
          this.value = [...values];
        }
      }
    }
  }

  onSorted = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    this.sorted.emit(this.value);
  };

  onAddItem = (item: any) => {
    const values: any[] = this.value || [];
    values.push(item);
    this.value = [...values];
  };

  onRemoveItem = (item: any) => {
    const values: any[] = this.value || [];
    const index = values.indexOf(item);
    if (!Number.isNaN(index)) {
      values.splice(index, 1);
      this.value = [...values];
    }
  };

  onUpdateItem = (item: any, newItem: any) => {
    assign(item, newItem);
    const values: any[] = this.value || [];
    this.value = [...values];
  };
}
