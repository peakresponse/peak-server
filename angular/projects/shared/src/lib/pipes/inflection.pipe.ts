import { Pipe, PipeTransform } from '@angular/core';

import * as inflection from 'inflection';

/**
 * Returns a complete asset url for a given asset path.
 */
@Pipe({
  name: 'inflection',
})
export class InflectionPipe implements PipeTransform {
  transform(value: string, type: string): string {
    if (value) {
      return (inflection as any)[type](value);
    }
    return value;
  }
}
