import { Component, Input } from '@angular/core';

@Component({
  selector: 'shared-error',
  templateUrl: './error.component.html',
})
export class ErrorComponent {
  @Input() error: any = null;
}
