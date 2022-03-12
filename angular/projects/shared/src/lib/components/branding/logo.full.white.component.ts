import { Component, Input } from '@angular/core';

@Component({
  selector: 'shared-logo-full-white',
  templateUrl: './logo.full.white.component.svg',
})
export class LogoFullWhite {
  @Input() width: number | string = '100%';
  @Input() height: number | string = 'auto';
}
