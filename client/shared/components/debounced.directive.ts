import { Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NgModel } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Directive({
  selector: '[ngModel][app-shared-debounced]',
})
export class DebouncedDirective implements OnInit, OnDestroy {
  @Input('app-shared-debounced') debounceTime = 300;
  @Output() debouncedValueChange = new EventEmitter<string>();

  valueSubscription: Subscription;

  constructor(private element: ElementRef, private ngModel: NgModel) {}

  ngOnInit() {
    this.valueSubscription = this.ngModel.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((newValue) => this.debouncedValueChange.emit(newValue));
  }

  ngOnDestroy() {
    this.valueSubscription.unsubscribe();
  }
}
