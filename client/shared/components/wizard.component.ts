import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-shared-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class WizardComponent {
  @Input() isLoading = false;

  @Input() isCancelEnabled = true;
  @Input() isCancelVisible = true;

  @Input() isBackEnabled = true;
  @Input() isBackVisible = true;

  @Input() isSkipVisible = false;

  @Input() isNextEnabled = true;
  @Input() isNextVisible = true;

  @Input() isSubmitEnabled = true;
  @Input() isSubmitVisible = false;

  @Input() isDoneEnabled = true;
  @Input() isDoneVisible = false;

  @Output() cancel = new EventEmitter<any>();
  @Output() back = new EventEmitter<any>();
  @Output() skip = new EventEmitter<any>();
  @Output() next = new EventEmitter<any>();
  @Output() submit = new EventEmitter<any>();
  @Output() done = new EventEmitter<any>();

  onCancel() {
    this.cancel.emit();
  }

  onBack() {
    this.back.emit();
  }

  onSkip() {
    this.skip.emit();
  }

  onNext() {
    this.next.emit();
  }

  onSubmit() {
    this.submit.emit();
  }

  onDone() {
    this.done.emit();
  }
}
