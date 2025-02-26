import { Component, Input } from '@angular/core';

@Component({
  selector: 'shared-logo-full-dark',
  templateUrl: './logo.full.dark.component.svg',
  standalone: false,
})
export class LogoFullDark {
  @Input() width: number | string = '100%';
  @Input() height: number | string = 'auto';
}
