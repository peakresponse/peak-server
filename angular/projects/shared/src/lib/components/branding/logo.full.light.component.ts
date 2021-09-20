import { Component, Input } from '@angular/core';

@Component({
  selector: 'shared-logo-full-light',
  templateUrl: './logo.full.light.component.svg',
})
export class LogoFullLight {
  @Input() width: number | string = '100%';
  @Input() height: number | string = 'auto';
}
