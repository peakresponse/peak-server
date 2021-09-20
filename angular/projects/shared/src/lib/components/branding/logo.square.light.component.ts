import { Component, Input } from '@angular/core';

@Component({
  selector: 'shared-logo-square-light',
  templateUrl: './logo.square.light.component.svg',
})
export class LogoSquareLight {
  @Input() width: number | string = '100%';
  @Input() height: number | string = 'auto';
}
