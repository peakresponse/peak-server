import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

/**
 * Returns a css url for a given asset path.
 */
@Pipe({
  name: 'cssUrl',
})
export class CssUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(url: string, fallback = 'none'): string | SafeStyle {
    if (url) {
      return this.sanitizer.bypassSecurityTrustStyle(`url("${url}")`);
    }
    return fallback;
  }
}
