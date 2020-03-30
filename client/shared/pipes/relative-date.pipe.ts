import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

/**
 * Returns a complete asset url for a given asset path.
 */
@Pipe({
  name: 'relativeDate'
})
export class RelativeDatePipe implements PipeTransform {
  transform(date: string, from: any): string {
    if (from) {
      return moment(date).from(from);
    } else {
      return moment(date).fromNow();
    }
  }
}
