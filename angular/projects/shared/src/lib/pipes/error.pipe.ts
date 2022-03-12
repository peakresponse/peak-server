import { Pipe, PipeTransform } from '@angular/core';

/**
 * Searches for an error with the given path.
 */
@Pipe({
  name: 'error',
})
export class ErrorPipe implements PipeTransform {
  transform(errors: any[], path: string): any {
    if (errors && path) {
      for (let error of errors) {
        if (error.path == path) {
          return error;
        }
      }
    }
    return '';
  }
}
