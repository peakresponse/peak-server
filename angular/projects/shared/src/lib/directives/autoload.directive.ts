import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[shared-autoload]',
  exportAs: 'sharedAutoload',
})
export class AutoloadDirective {
  @Input('shared-autoload') paginationLink: string = '';
  @Output() onLoadMore = new EventEmitter<string>();

  constructor(private el: ElementRef) {
    setTimeout(() => this.onWindowScroll(null), 100);
  }

  private offsetTop() {
    let element = this.el.nativeElement;
    if (!element) {
      return Number.MAX_VALUE;
    }
    let offsetTop = element.offsetTop;
    while (element.offsetParent != document.body) {
      element = element.offsetParent;
      if (!element) {
        return Number.MAX_VALUE;
      }
      offsetTop += element.offsetTop;
    }
    return offsetTop;
  }

  onScroll($event: any) {
    // if this method is being called, then assume we're scrolling within the offsetParent element rather than the window
    const top = this.el.nativeElement.offsetTop;
    const parent = this.el.nativeElement.offsetParent;
    if (parent.scrollTop >= top - 1.25 * parent.offsetHeight) {
      this.onLoadMore.emit(this.paginationLink);
    }
  }

  @HostListener('window:scroll', ['$event'])
  private onWindowScroll($event: any) {
    if (this.paginationLink) {
      if (window.scrollY >= this.offsetTop() - 1.25 * window.innerHeight) {
        this.onLoadMore.emit(this.paginationLink);
      }
    }
  }
}
