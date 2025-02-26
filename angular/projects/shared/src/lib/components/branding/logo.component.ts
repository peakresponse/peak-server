import { Component, Input } from '@angular/core';

@Component({
  selector: 'shared-logo',
  templateUrl: './logo.component.html',
  standalone: false,
})
export class Logo {
  @Input() type: string = 'full';
  @Input() color: string = 'dark';
  @Input() width: number | string = '100%';
  @Input() height: number | string = 'auto';
}
