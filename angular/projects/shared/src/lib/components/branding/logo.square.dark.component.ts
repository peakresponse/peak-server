import { Component, Input } from '@angular/core';

@Component({
  selector: 'shared-logo-square-dark',
  templateUrl: './logo.square.dark.component.svg',
  standalone: false,
})
export class LogoSquareDark {
  @Input() width: number | string = '100%';
  @Input() height: number | string = 'auto';
}
