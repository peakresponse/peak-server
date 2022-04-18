import { Pipe, PipeTransform } from '@angular/core';

import { get } from 'lodash';

/**
 * Returns the value (or first value of an array) for the given attribute path.
 */
@Pipe({
  name: 'get',
})
export class GetPipe implements PipeTransform {
  transform(obj: any, path: string[]): any {
    let result = get(obj, path);
    if (Array.isArray(result)) {
      if (result.length > 0) {
        result = result[0];
      } else {
        result = null;
      }
    }
    return result;
  }
}
