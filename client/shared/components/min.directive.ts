import { Directive, Input, SimpleChanges } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn, Validators } from '@angular/forms';

@Directive({
  selector: '[min][formControlName],[min][formControl],[min][ngModel]',
  providers: [{ provide: NG_VALIDATORS, useExisting: MinValidatorDirective, multi: true }],
  host: { '[attr.min]': 'min ? min : null' },
})
export class MinValidatorDirective implements Validator {
  @Input('min') min: string | number;

  private _validator: ValidatorFn;
  private _onChange: () => void;

  ngOnChanges(changes: SimpleChanges): void {
    if ('min' in changes) {
      this._createValidator();
      if (this._onChange) this._onChange();
    }
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return this.min == null ? null : this._validator(control);
  }

  registerOnValidatorChange(fn: () => void): void {
    this._onChange = fn;
  }

  private _createValidator(): void {
    this._validator = Validators.min(typeof this.min === 'number' ? this.min : parseInt(this.min, 10));
  }
}
