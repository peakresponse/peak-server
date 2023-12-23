import { Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NgModel } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Directive({
  selector: '[ngModel][shared-debounced]',
})
export class DebouncedDirective implements OnInit, OnDestroy {
  @Input('shared-debounced') debounceTime?: number;
  @Output() debouncedValueChange = new EventEmitter<string>();

  valueSubscription?: Subscription;

  constructor(
    private element: ElementRef,
    private ngModel: NgModel,
  ) {}

  ngOnInit() {
    this.valueSubscription = this.ngModel.valueChanges
      ?.pipe(debounceTime(this.debounceTime ?? 300), distinctUntilChanged())
      .subscribe((newValue: any) => this.debouncedValueChange.emit(newValue));
  }

  ngOnDestroy() {
    this.valueSubscription?.unsubscribe();
  }
}
