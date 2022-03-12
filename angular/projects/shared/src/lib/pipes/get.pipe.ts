import { Pipe, PipeTransform } from '@angular/core';

import { get } from 'lodash';

/**
 * Searches for an error with the given path.
 */
@Pipe({
  name: 'get',
})
export class GetPipe implements PipeTransform {
  transform(obj: any, path: string[]): any {
    return get(obj, path);
  }
}
