import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formats matching version strings.
 */
@Pipe({
  name: 'version',
})
export class VersionPipe implements PipeTransform {
  transform(value: string): string {
    if (value) {
      let m;
      m = value.match(/^(\d\d\d\d-\d\d-\d\d)-([\da-f]+)$/);
      if (m) {
        return `${m[1]} (${m[2].substring(0, 8)})`;
      }
    }
    return value;
  }
}
