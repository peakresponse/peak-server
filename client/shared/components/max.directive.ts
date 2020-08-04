import { Directive, Input, SimpleChanges } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn, Validators } from '@angular/forms';

@Directive({
  selector: '[max][formControlName],[max][formControl],[max][ngModel]',
  providers: [{provide: NG_VALIDATORS, useExisting: MaxValidatorDirective, multi: true}],
  host: {'[attr.max]': 'max ? max : null'}
})
export class MaxValidatorDirective implements Validator {
  @Input('max') max: string|number;

  private _validator: ValidatorFn;
  private _onChange: () => void;

  ngOnChanges(changes: SimpleChanges): void {
    if ('max' in changes) {
      this._createValidator();
      if (this._onChange) this._onChange();
    }
  }

  validate(control: AbstractControl): ValidationErrors|null {
    return this.max == null ? null : this._validator(control);
  }

  registerOnValidatorChange(fn: () => void): void {
    this._onChange = fn;
  }

  private _createValidator(): void {
    this._validator = Validators.max(
        typeof this.max === 'number' ? this.max : parseInt(this.max, 10));
  }
}
