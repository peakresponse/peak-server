import { Pipe, PipeTransform } from '@angular/core';

/**
 * Returns a css url for a given asset path.
 */
@Pipe({
  name: 'cssUrl'
})
export class CssUrlPipe implements PipeTransform {
  transform(url: string, fallback = 'none'): string {
    if (url) {
      return `url("${url}")`;
    }
    return fallback;
  }
}
