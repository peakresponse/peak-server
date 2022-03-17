import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[routerLink]',
})
export class RouterLinkClassDirective {
  constructor(private element: ElementRef) {
    element.nativeElement.classList.add('router-link');
  }
}
