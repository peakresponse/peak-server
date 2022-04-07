import { Pipe, PipeTransform } from '@angular/core';

/**
 * Transforms a string/number representing a duration
 * in seconds into h:mm:ss.
 */
@Pipe({
  name: 'duration',
})
export class DurationPipe implements PipeTransform {
  transform(duration?: number | string): string {
    if (duration) {
      let seconds = 0;
      if (typeof duration === 'number') {
        seconds = duration;
      } else if (typeof duration === 'string') {
        seconds = parseInt(duration, 10);
      }
      const sec = Math.round(seconds) % 60;
      const min = Math.floor(seconds / 60) % 60;
      const hour = Math.floor(seconds / 3600);
      return `${hour > 0 ? `${hour}:` : ''}${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
    }
    return '--:--';
  }
}
