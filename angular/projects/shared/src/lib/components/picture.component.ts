import { Component, Input } from '@angular/core';

@Component({
  selector: 'shared-picture',
  templateUrl: './picture.component.html',
})
export class PictureComponent {
  @Input() pictureUrl: string = '';

  get pictureCssUrl(): string {
    if (this.pictureUrl) {
      return `url(${this.pictureUrl})`;
    }
    return 'none';
  }
}
